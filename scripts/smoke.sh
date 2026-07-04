#!/usr/bin/env bash
# end to end smoke test against a local anvil deploy
# mints mock stock tokens, mints basket shares, checks pricing, redeems
#
# usage:
#   anvil                       terminal 1
#   scripts/deploy.sh local     terminal 2
#   scripts/smoke.sh            terminal 2

set -Eeuo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/apps/frontend/.env.local"
RPC_URL="${RPC_URL:-http://localhost:8545}"

# anvil default account zero, a public test key, never use this pattern on live networks
KEY="0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80"
ADDR="0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266"

[[ -f "$ENV_FILE" ]] || {
    echo "missing $ENV_FILE, run scripts/deploy.sh local first" >&2
    exit 1
}

BASKET=$(grep NEXT_PUBLIC_DEMO_BASKET_ADDRESS "$ENV_FILE" | cut -d= -f2)
FACTORY=$(grep NEXT_PUBLIC_FACTORY_ADDRESS "$ENV_FILE" | cut -d= -f2)

fail() {
    echo "FAIL: $1" >&2
    exit 1
}

echo "factory $FACTORY, basket $BASKET" >&2

# ----- factory registered the basket -----

IS_BASKET=$(cast call "$FACTORY" "isBasket(address)(bool)" "$BASKET" --rpc-url "$RPC_URL")
[[ "$IS_BASKET" == "true" ]] || fail "factory does not recognize demo basket"

# ----- approve components -----

COUNT=$(cast call "$BASKET" "componentCount()(uint256)" --rpc-url "$RPC_URL")
for ((i = 0; i < COUNT; i++)); do
    TOKEN=$(cast call "$BASKET" "componentAt(uint256)((address,address,uint256))" "$i" --rpc-url "$RPC_URL" | grep -oE '0x[0-9a-fA-F]{40}' | head -1)
    cast send "$TOKEN" "approve(address,uint256)" "$BASKET" "$(cast max-uint)" \
        --private-key "$KEY" --rpc-url "$RPC_URL" >/dev/null
done

# ----- mint two shares -----

cast send "$BASKET" "mint(uint256,address)" 2000000000000000000 "$ADDR" \
    --private-key "$KEY" --rpc-url "$RPC_URL" >/dev/null

BALANCE=$(cast call "$BASKET" "balanceOf(address)(uint256)" "$ADDR" --rpc-url "$RPC_URL" | awk '{print $1}')
[[ "$BALANCE" == "2000000000000000000" ]] || fail "expected 2e18 shares, got $BALANCE"

# ----- pricing -----

PRICE=$(cast call "$BASKET" "sharePriceUsd()(uint256)" --rpc-url "$RPC_URL" | awk '{print $1}')
[[ "$PRICE" -gt 0 ]] || fail "share price should be positive, got $PRICE"
# price has 8 decimals, pad 10 zeros to reuse the 18 decimal formatter
echo "share price: \$$(cast --from-wei "${PRICE}0000000000" ether | head -c 8) (raw $PRICE)" >&2

VALUE=$(cast call "$BASKET" "balanceValueUsd(address)(uint256)" "$ADDR" --rpc-url "$RPC_URL" | awk '{print $1}')
[[ "$VALUE" == $((PRICE * 2)) ]] || fail "balance value should be twice share price"

# ----- redeem everything -----

cast send "$BASKET" "redeem(uint256,address)" 2000000000000000000 "$ADDR" \
    --private-key "$KEY" --rpc-url "$RPC_URL" >/dev/null

SUPPLY=$(cast call "$BASKET" "totalSupply()(uint256)" --rpc-url "$RPC_URL" | awk '{print $1}')
[[ "$SUPPLY" == "0" ]] || fail "total supply should be zero after redeem, got $SUPPLY"

echo "smoke test passed" >&2

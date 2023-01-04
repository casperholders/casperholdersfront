#!/usr/bin/env bash

cat > secret.pem << EOF
-----BEGIN PRIVATE KEY-----
$FAKE_KEY
-----END PRIVATE KEY-----
EOF

check_rpc () {
	curl --fail "$1"/rpc
}

while check_rpc "$1" ; [ $? -ne 0 ];do
    echo Waiting for rpc...
    sleep 1
done

check_block () {
	docker run killianh/casperclient  get-block --node-address "$1"
}

while check_block "$1" ; [ $? -ne 0 ];do
    echo Waiting for blocks...
    sleep 1
done

docker run -v $(pwd)/secret.pem:/secret.pem killianh/casperclient  transfer \
	--transfer-id 1 \
	--node-address "$1" \
	--amount 999999999999999899999999000000000 \
	--secret-key /secret.pem \
	--chain-name casper-net-1 \
	--target-account 01a5A5B7328118681638BE3e06c8749609280Dba4c9DAF9AeB3D3464b8839B018a \
	--payment-amount 10000

deployHash=$(docker run -v $(pwd)/secret.pem:/secret.pem -v $(pwd)/.github/data/get_system_contracts_call.wasm:/get_system_contracts_call.wasm killianh/casperclient  put-deploy \
	--session-path /get_system_contracts_call.wasm \
	--node-address "$1" \
	--secret-key /secret.pem \
	--chain-name casper-net-1 \
	--payment-amount 10000000000 \
	| jq -r '.result.deploy_hash')

echo Deploy hash : $deployHash

check_deploy_result () {
	docker run killianh/casperclient  get-deploy \
	--node-address "$1" ${deployHash} \
	| jq -e -r '.result.execution_results[].result.Success.effect.transforms[]
	| select(.transform | index("AddKeys"))
	| select(.transform.AddKeys[].name
	| contains("auction"))
	| .transform.AddKeys[].key |= sub("-007$"; "-000")
	| .transform.AddKeys[].key '
}

while check_deploy_result "$1" ; [ $? -ne 0 ];do
    echo Waiting for result...
    sleep 1
done

uref=$(docker run killianh/casperclient  get-deploy \
	--node-address "$1" ${deployHash} \
	| jq -r '.result.execution_results[].result.Success.effect.transforms[]
	| select(.transform | index("AddKeys"))
	| select(.transform.AddKeys[].name
	| contains("auction"))
	| .transform.AddKeys[].key |= sub("-007$"; "-000")
	| .transform.AddKeys[].key ')

echo $uref

contract=$(docker run killianh/casperclient  get-deploy \
	--node-address "$1" ${deployHash} \
	| jq -r --arg uref "$uref" '.result.execution_results[].result.Success.effect.transforms[]
	| select(.key | contains($uref))
	| .transform.WriteCLValue.parsed')

contract=${contract#"contract-"}

echo $contract

echo "VITE_APP_AUCTION_MANAGER_HASH=$(echo $contract)"

echo "VITE_APP_AUCTION_MANAGER_HASH=$(echo $contract)" >> $GITHUB_ENV

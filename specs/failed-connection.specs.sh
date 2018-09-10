#!/bin/bash
### TESTING service shutdowns on mongodb disconnects
# all tests should lead to an return code greater than 0
### CLEANUP
docker rm -f mongoattrixtest > /dev/null 2>&1
docker run -d --name=mongoattrixtest -p 37017:27017 mongo > /dev/null
docker stop mongoattrixtest > /dev/null

function test1() {
	echo =======================================================
	echo started mongo + shutdown
	echo -------------------------------------------------------
	echo starting mongo
	docker start mongoattrixtest > /dev/null
	echo starting node
	MONGOOSE_RECONNECT_TRIES=3 MONGO_SRV=localhost:37017 node specs/start-service.js >/dev/null &
	NODE_PID1=$!
	sleep 2
	echo stopping mongo
	docker stop mongoattrixtest > /dev/null

	wait $NODE_PID1
	RC1=$?
	echo -------------------------------------------------------
	if [ $RC1 -ne 0 ]
	then
		echo "succeeded with return code $RC1"
	else
		echo "failed $RC1"
		exit 1
	fi

	kill $NODE_PID1 > /dev/null 2>&1
}

function test2() {
	## SECOND TEST
	echo =======================================================
	echo starting mongo after node + shutdown
	echo -------------------------------------------------------
	echo starting node
	MONGOOSE_RECONNECT_TRIES=3 MONGO_SRV=localhost:37017 node specs/start-service.js > /dev/null &
	NODE_PID2=$!
	sleep 2
	echo starting mongo
	docker start mongoattrixtest > /dev/null
	sleep 5
	echo stopping mongo
	docker stop mongoattrixtest > /dev/null

	wait $NODE_PID2
	RC2=$?
	echo -------------------------------------------------------
	if [ $RC2 -ne 0 ]
	then
		echo "succeeded with return code $RC2"
	else
		echo "failed $RC2"
		exit 1
	fi

	kill $NODE_PID2 > /dev/null 2>&1
}

function test3() {
	echo =======================================================
	echo reconnects with started mongo
	echo -------------------------------------------------------
	echo starting mongo
	docker start mongoattrixtest > /dev/null
	echo starting node
	MONGOOSE_RECONNECT_TRIES=3 MONGO_SRV=localhost:37017 node specs/start-service.js >/dev/null &
	NODE_PID3=$!
	sleep 3
	echo stopping mongo
	docker stop mongoattrixtest > /dev/null
	sleep 2
	echo starting mongo
	docker start mongoattrixtest > /dev/null
	sleep 5
	echo stopping mongo
	docker stop mongoattrixtest > /dev/null

	wait $NODE_PID3
	RC3=$?
	echo -------------------------------------------------------
	if [ $RC3 -ne 0 ]
	then
		echo "succeeded with return code $RC3"
	else
		echo "failed $RC3"
		exit 1
	fi

	kill $NODE_PID3 > /dev/null 2>&1
}

function test4() {
	### THIRD TEST
	echo =======================================================
	echo reconnects with starting mongo after node
	echo -------------------------------------------------------
	echo starting node
	MONGOOSE_RECONNECT_TRIES=3 MONGO_SRV=localhost:37017 node specs/start-service.js >/dev/null &
	NODE_PID4=$!
	sleep 1
	echo starting mongo
	docker start mongoattrixtest > /dev/null
	sleep 5
	echo stopping mongo
	docker stop mongoattrixtest > /dev/null
	sleep 2
	echo starting mongo
	docker start mongoattrixtest > /dev/null
	sleep 5
	echo stopping mongo
	docker stop mongoattrixtest > /dev/null

	wait $NODE_PID4
	RC4=$?
	echo -------------------------------------------------------
	if [ $RC4 -ne 0 ]
	then
		echo "succeeded with return code $RC4"
	else
		echo "failed $RC4"
		exit 1
	fi

	kill $NODE_PID4 > /dev/null 2>&1
}

function test5() {
	## FIFTH TEST
	echo =======================================================
	echo no mongo started
	echo -------------------------------------------------------
	echo starting node
	MONGOOSE_RECONNECT_TRIES=3 MONGO_SRV=localhost:37017 node specs/start-service.js >/dev/null &
	NODE_PID1=$!

	wait $NODE_PID1
	RC1=$?
	echo -------------------------------------------------------
	if [ $RC1 -ne 0 ]
	then
		echo "succeeded with return code $RC1"
	else
		echo "failed $RC1"
		exit 1
	fi

	kill $NODE_PID1 > /dev/null 2>&1
}

test1
test2
test3
test4
test5

### CLEANUP
docker rm -f mongoattrixtest > /dev/null 2>&1

PACKAGE=$(shell cat package.json | jq ".name" | sed 's/@trigo\///')

install:
	yarn install

test:
	yarn test

lint:
	yarn run lint

build: .
	docker-compose -f docker-compose.test.yml build

clean:
	rm -rf node_modules/

ci-test: build
	docker-compose -f docker-compose.test.yml run --rm $(PACKAGE); \
		test_exit=$$?; \
		docker-compose -f docker-compose.test.yml down; \
		exit $$test_exit

publish: build
	@if [ $$(cat package.json| jq .version) != \"$$(npm show @trigo/$(PACKAGE) version)\" ]; then \
		docker-compose -f docker-compose.test.yml run --rm $(PACKAGE) npm publish; \
		test_exit=$$?; \
		docker-compose -f docker-compose.test.yml down; \
		exit $$test_exit; \
	else \
		echo "Version unchanged, no need to publish"; \
	fi

setup-dev:
	@cd lib && npm link
	@cd examples && npm link @trigo/atrix
	@cd examples && npm install
	@npm install

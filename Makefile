PACKAGE=$(shell cat package.json | jq ".name" | sed 's/@trigo\///')

PUBLISHED_VERSION:=$(shell npm show @trigo/$(PACKAGE) version)
REPO_VERSION:=$(shell cat package.json| jq .version)

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
	docker-compose -f docker-compose.test.yml run --rm $(PACKAGE) \
	   	/bin/bash -c 'if [ "$(PUBLISHED_VERSION)" != $(REPO_VERSION) ]; then \
			npm publish; \
		else \
			echo "Version unchanged, no need to publish"; \
		fi'; EXIT_CODE=$$?; \
	docker-compose -f docker-compose.test.yml down; \
	exit $$EXIT_CODE \


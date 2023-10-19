include ../*.mk

.PHONY: all motoko rust azle build perf
all: build perf

motoko:
	$(call build_with_mops,motoko)

rust:
	$(call build,rust)

azle:
	$(call build,azle)

build: motoko rust azle

perf:
	$(call perf_two,dapps,basic_dao.sh,nft.sh)

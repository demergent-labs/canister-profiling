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
	$(call perf_three,pub-sub,motoko/perf.sh,rust/perf.sh,azle/perf.sh)

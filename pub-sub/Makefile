include ../*.mk

.PHONY: all motoko rust azle@0.17.1 build perf
all: build perf

motoko:
	$(call build_with_mops,motoko)

rust:
	$(call build,rust)

azle@0.17.1:
	$(call build,azle@0.17.1)

build: motoko rust azle@0.17.1

perf:
	$(call perf_two,pub-sub,motoko/perf.sh,rust/perf.sh,azle@0.17.1/perf.sh)

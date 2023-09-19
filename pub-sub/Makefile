include ../*.mk

.PHONY: all motoko rust build perf
all: build perf

motoko:
	$(call build_with_mops,motoko)

rust:
	$(call build,rust)

azle:
	$(call build,azle_pre_v0.18.0)

build: motoko rust azle

perf:
	$(call perf_two,pub-sub,motoko/perf.sh,rust/perf.sh,azle_pre_v0.18.0/perf.sh)

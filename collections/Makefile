include ../*.mk

.PHONY: all motoko rust azle@0.17.1 azle@0.18.0 build perf
all: build perf

motoko:
	$(call build_with_mops,motoko)

rust:
	$(call build,rust)

azle@0.17.1:
	$(call build,azle@0.17.1)

azle@0.18.0:
	$(call build,azle@0.18.0)

build: motoko rust azle@0.17.1 azle@0.18.0

perf:
	$(call perf,collections,perf.sh)

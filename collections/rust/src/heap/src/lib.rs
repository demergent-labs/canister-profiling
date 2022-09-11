use std::collections::BinaryHeap;
use std::cell::RefCell;
use std::cmp::Reverse;

struct Random {
    state: u32,
    size: Option<u32>,
    ind: u32,
}
impl Random {
    pub fn new(size: Option<u32>, seed: u32) -> Self {
        Random { state: seed, size, ind: 0 }
    }
}
impl Iterator for Random {
    type Item = u32;
    fn next(&mut self) -> Option<Self::Item> {
        if let Some(size) = self.size {
            self.ind += 1;
            if self.ind > size {
                return None;
            }
        }
        self.state = self.state * 48271 % 0x7fffffff;
        Some(self.state)
    }
}

#[derive(PartialOrd, Ord, PartialEq, Eq)]
struct Item {
    k: u32,
    v: String,
}

thread_local! {
    static MAP: RefCell<BinaryHeap<Reverse<(u32, String)>>> = RefCell::default();
    static RAND: RefCell<Random> = RefCell::new(Random::new(None, 42));
}

#[ic_cdk_macros::update]
fn generate(size: u32) {
    let rand = Random::new(Some(size), 1);
    let iter = rand.map(|x| Reverse((x, x.to_string())));
    MAP.with(|map| {
        let mut map = map.borrow_mut();
        *map = iter.collect::<BinaryHeap<Reverse<(u32, String)>>>();
    });
}

#[ic_cdk_macros::update]
fn batch_get(n: u32) {
    MAP.with(|map| {
        let mut map = map.borrow_mut();
        RAND.with(|rand| {
            let mut rand = rand.borrow_mut();
            for _ in 0..n {
                let _k = rand.next().unwrap();
                map.pop();
            }
        })
    })
}

#[ic_cdk_macros::update]
fn batch_put(n: u32) {
    MAP.with(|map| {
        let mut map = map.borrow_mut();
        RAND.with(|rand| {
            let mut rand = rand.borrow_mut();
            for _ in 0..n {
                let k = rand.next().unwrap();
                map.push(Reverse((k, k.to_string())));
            }
        })
    })
}

#[ic_cdk_macros::update]
fn batch_remove(n: u32) {
    MAP.with(|map| {
        let mut map = map.borrow_mut();
        RAND.with(|rand| {
            let mut rand = rand.borrow_mut();
            for _ in 0..n {
                let _k = rand.next().unwrap();
                map.pop();
            }
        })
    })
}
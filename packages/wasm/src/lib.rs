//! LocalMock WASM Engine
//!
//! High-performance hot loop for data generation compiled to WebAssembly.
//! Handles random number generation, string building, and Luhn checksum validation.

use wasm_bindgen::prelude::*;

// Simple xorshift64 PRNG for fast random number generation
struct Xorshift64 {
    state: u64,
}

impl Xorshift64 {
    fn new(seed: u64) -> Self {
        Self { state: if seed == 0 { 1 } else { seed } }
    }

    fn next(&mut self) -> u64 {
        let mut x = self.state;
        x ^= x << 13;
        x ^= x >> 7;
        x ^= x << 17;
        self.state = x;
        x
    }

    /// Random u64 in range [min, max] inclusive
    fn range(&mut self, min: u64, max: u64) -> u64 {
        if min >= max {
            return min;
        }
        let range = max - min + 1;
        min + (self.next() % range)
    }

    /// Random f64 in range [min, max)
    fn range_f64(&mut self, min: f64, max: f64) -> f64 {
        let t = (self.next() as f64) / (u64::MAX as f64);
        min + t * (max - min)
    }
}

/// Generate N random integers in [min, max] range.
/// Returns a Vec<i64> serialized as a Float64Array via wasm-bindgen.
#[wasm_bindgen]
pub fn generate_integers(count: u32, min: i64, max: i64, seed: u64) -> Vec<f64> {
    let mut rng = Xorshift64::new(seed);
    let mut results = Vec::with_capacity(count as usize);

    for _ in 0..count {
        let val = rng.range(min as u64, max as u64) as i64;
        results.push(val as f64);
    }

    results
}

/// Generate N random floats in [min, max) with given decimal precision.
#[wasm_bindgen]
pub fn generate_floats(count: u32, min: f64, max: f64, precision: u32, seed: u64) -> Vec<f64> {
    let mut rng = Xorshift64::new(seed);
    let factor = 10f64.powi(precision as i32);
    let mut results = Vec::with_capacity(count as usize);

    for _ in 0..count {
        let val = rng.range_f64(min, max);
        let rounded = (val * factor).round() / factor;
        results.push(rounded);
    }

    results
}

/// Generate N random alphanumeric strings of given length.
/// Returns a single string with values separated by newlines.
#[wasm_bindgen]
pub fn generate_alphanumeric(count: u32, length: u32, seed: u64) -> String {
    let mut rng = Xorshift64::new(seed);
    let charset = b"ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let charset_len = charset.len() as u64;

    let mut result = String::with_capacity((count * (length + 1)) as usize);

    for i in 0..count {
        if i > 0 {
            result.push('\n');
        }
        for _ in 0..length {
            let idx = rng.next() % charset_len;
            result.push(charset[idx as usize] as char);
        }
    }

    result
}

/// Generate N random hexadecimal strings of given length.
#[wasm_bindgen]
pub fn generate_hex(count: u32, length: u32, seed: u64) -> String {
    let mut rng = Xorshift64::new(seed);
    let hex_chars = b"0123456789abcdef";

    let mut result = String::with_capacity((count * (length + 1)) as usize);

    for i in 0..count {
        if i > 0 {
            result.push('\n');
        }
        for _ in 0..length {
            let idx = rng.next() % 16;
            result.push(hex_chars[idx as usize] as char);
        }
    }

    result
}

/// Generate N valid Luhn-checksum numbers of given digit count.
/// Used for credit card numbers, IMEIs, etc.
#[wasm_bindgen]
pub fn generate_luhn(count: u32, digits: u32, seed: u64) -> String {
    let mut rng = Xorshift64::new(seed);
    let mut result = String::with_capacity((count * (digits + 1)) as usize);

    for i in 0..count {
        if i > 0 {
            result.push('\n');
        }

        // Generate (digits - 1) random digits
        let mut number = Vec::with_capacity(digits as usize);
        for _ in 0..(digits - 1) {
            number.push((rng.next() % 10) as u8);
        }

        // Calculate Luhn check digit
        let check = luhn_check_digit(&number);
        number.push(check);

        // Convert to string
        for d in &number {
            result.push((b'0' + d) as char);
        }
    }

    result
}

/// Calculate Luhn check digit for a sequence of digits.
fn luhn_check_digit(digits: &[u8]) -> u8 {
    let mut sum: u32 = 0;
    let parity = digits.len() % 2;

    for (i, &d) in digits.iter().enumerate() {
        let mut val = d as u32;
        if i % 2 == parity {
            val *= 2;
            if val > 9 {
                val -= 9;
            }
        }
        sum += val;
    }

    ((10 - (sum % 10)) % 10) as u8
}

/// Pick N random indices from a pool of given size.
/// Used for selecting from name pools, enum values, etc.
#[wasm_bindgen]
pub fn pick_random_indices(count: u32, pool_size: u32, seed: u64) -> Vec<u32> {
    let mut rng = Xorshift64::new(seed);
    let mut results = Vec::with_capacity(count as usize);

    for _ in 0..count {
        results.push((rng.next() % pool_size as u64) as u32);
    }

    results
}

/// Generate N UUIDs (v4 format).
#[wasm_bindgen]
pub fn generate_uuids(count: u32, seed: u64) -> String {
    let mut rng = Xorshift64::new(seed);
    let hex = b"0123456789abcdef";
    // UUID v4: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
    // y is one of 8, 9, a, b

    let mut result = String::with_capacity((count * 37) as usize);

    for i in 0..count {
        if i > 0 {
            result.push('\n');
        }

        for pos in 0..36 {
            match pos {
                8 | 13 | 18 | 23 => result.push('-'),
                14 => result.push('4'), // version
                19 => {
                    // variant: 8, 9, a, or b
                    let variant = b"89ab"[(rng.next() % 4) as usize];
                    result.push(variant as char);
                }
                _ => {
                    let idx = rng.next() % 16;
                    result.push(hex[idx as usize] as char);
                }
            }
        }
    }

    result
}

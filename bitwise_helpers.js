export const nth_bit_of_flags_cleared = (flags, n) => flags & ~(1 << n)
export const nth_bit_of_flags_on = (flags, n) => flags |= 1 << n
export const get_nth_bit_of_flags = (flags, n) => (flags >> (n)) & 1

// Basically an enum
export const flag_places = {
    left: 0,
    right: 1,
    up: 2,
    down: 3,
}

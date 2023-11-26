export function isEmpty(value: any) {
  return (value == null || (typeof value === "string" && value.trim().length === 0));
}

// console.log(isEmpty("text")); // false
// console.log(isEmpty(1)); // false
// console.log(isEmpty([])); // false
// console.log(isEmpty({})); // false
// console.log(isEmpty(false)); // false
// console.log(isEmpty(0)); // false
// console.log(isEmpty(-0)); // false
// console.log(isEmpty(NaN)); // false

// console.log(isEmpty("")); // true
// console.log(isEmpty("    ")); // true
// console.log(isEmpty(null)); // true
// console.log(isEmpty(undefined)); // true
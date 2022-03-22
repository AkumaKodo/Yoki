# Yoki

Yoki is a fast caching layer for Deno modules with javascript. Extended from the Internal js Map class but with more utilities.

**Example**

```ts
const Cache = new Yoki({
  debug_mode: true,
});

Cache.size; // => 0

Cache.create("1", {
  name: "Yoki test 1",
}); // => { name: "Yoki test 1" }

Cache.create("2", {
  name: "Yoki test 2",
}); // => { name: "Yoki test 2" }

Cache.create("3", {
  name: "Yoki test 3",
}); // => { name: "Yoki test 3" }

Cache.exists("1"); // => true

Cache.find("1"); // => { name: "Yoki test 1" }
```

## Usage & methods

*soon*
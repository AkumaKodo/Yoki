import { Yoki } from "../mod.ts";

const Cache = new Yoki({
  debug_mode: true,
});

console.clear()

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

Cache.findKeys // => ["1", "2", "3"]

Cache.findValues // => [{ name: "Yoki test 1" }, { name: "Yoki test 2" }, { name: "Yoki test 3" }]

Cache.size; // => 3
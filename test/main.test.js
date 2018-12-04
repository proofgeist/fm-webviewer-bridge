const fm = require("../src/main.js");

console.log(fm);
test("it should have specific properties", () =>
	expect(fm).toHaveProperty(
		"initialPropsLoaded",
		"callFMScript",
		"initialPropsLoaded",
		"externalAPI"
	));

test("it allow a user to add methods", () =>
	expect(fm.externalAPI()).toHaveProperty("addMethods"));

//general imports
import React from "react";
import ReactDOM from "react-dom";
import MyComponent from "../components/MyComponent";
import axios from "axios";
import * as math from "../modules/math";
//enzyme imports
import Enzyme, { shallow, mount } from "enzyme";
import Adapter from "enzyme-adapter-react-16";
//react-testing-library imports
import {
  render,
  fireEvent,
  waitForElement,
  queryAllByTestId,
  getByTestId,
  screen,
} from "@testing-library/react";
import "@testing-library/jest-dom/extend-expect";
//puppeteer imports
import puppeteer from "puppeteer";

//JEST GENERAL

//jest is the most popular JavaScript testrunner/assertion library and it's included with create-react-app
//jest will detect any files with the word "test" or "spec" in them and will run these tests with the command "npm run test"
//the optional "describe" function groups related tests together and then the actual test will be the returned function from "test" (can also be called "it")

//some example functions to test
const sum = (a, b) => {
  return a + b;
};

const makePerson = (name, age) => {
  return {
    name,
    age,
  };
};

const getNames = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve(["harry", "william", "kate"]);
    }, 100);
  });
};

describe("vanilla JS functions", () => {
  //use toBe() for exact equality
  test("returns sum of two numbers", () => {
    expect(sum(1, 2)).toBe(3);
  });
  //use toEqual() for objects
  test("returns person object with name and age", () => {
    expect(makePerson("bob", 53)).toEqual({ name: "bob", age: 53 });
  });
  //prepend "not" to check for the opposite
  test("returns sum of two numbers", () => {
    expect(sum(1, 2)).not.toBe(5);
  });
  //for a promise, place the assertion inside the "then" block
  test("returns list of names after delay", () => {
    getNames().then((res) => {
      expect(res.length).toBeGreaterThan(0);
    });
  });
  //alternatively, use async await
  test("returns list of names after delay", async () => {
    const res = await getNames();
    expect(res.length).toBeGreaterThan(0);
  });

  //some other useful methods:

  //TRUTHINESS:
  //toBeNull();
  //toBeDefined();
  //toBeUndefined();
  //toBeTruthy();
  //toBeFalsy();

  //NUMBERS:
  //toBeGreaterThan();
  //toBeGreaterThanOrEqual();
  //toBeLessThan();
  //toBeLessThanOrEqual();
  //toBeCloseTo() - for floating point numbers

  //STRINGS
  //toMatch() - this checks against regular expressions

  //ARRAYS AND ITERABLES
  //toContain()

  //EXCEPTIONS
  //toThrow() - checks if function throws an error

  //you can also be specific:
  //toThrow("Wrong password")

  //full list: https://jestjs.io/docs/en/expect

  //another popular library is jest-dom which gives you some additional methods such as toBeVisible(), toHaveClass() and toHaveTextContent()
});

//with jest you can create mock functions
//these are just functions you can use in your tests as substitutes
//an example use case would be if you wanted to test a loop with a callback but the callback itself was not important
//they offer various useful methods not available with real functions

describe("mock functions", () => {
  test("demo some mock function methods", () => {
    const mock = jest.fn();
    const result = mock("hello");
    expect(result).toBeUndefined();
    expect(mock).toHaveBeenCalled();
    expect(mock).toHaveBeenCalledTimes(1);
    expect(mock).toHaveBeenCalledWith("hello");
  });
  test("return predefined value", () => {
    //will always return 5
    const mock = jest.fn().mockReturnValue(5);
    expect(mock("hello")).toBe(5);
  });
  test("return predefined value on first call only", () => {
    //will return "hi" first time it's called
    const mock = jest.fn().mockReturnValueOnce("hi");
    expect(mock("hello")).toBe("hi");
    //will return undefined after that
    expect(mock("hello")).toBe(undefined);
  });
  test("return promise", () => {
    //fake promise
    const mockPromise = jest.fn().mockResolvedValue(43);
    mockPromise().then((res) => {
      expect(res).toBe(43);
    });
  });
  test("return promise", async () => {
    //fake async await
    const mockAsync = jest.fn().mockResolvedValue(43);
    const res = await mockAsync();
    expect(res).toBe(43);
  });
});

//you can redirect functions you're testing to use mocked functions/modules during tests (e.g. if the real ones are IO instensive/slow)
//you can do this with individual functions by simply reassigning their value to jest.fn()
//you can also do it with every export of a module with jest.mock(path)

//imagine that we want to test this function but the the math.multiply() function it calls is expensive and we don't want to use it in testing
const printMultiplyAnswerMessage = (a, b) => {
  const answer = math.multiply(a, b);
  return `The answer is ${answer}`;
};

// //we instruct jest to use mock functions for the math module
// jest.mock("../modules/math.js");

// describe("use mocked module", () => {
//   test("multiplies two numbers", () => {
//     printMultiplyAnswerMessage(2, 3);
//     expect(math.multiply).toHaveBeenCalledWith(2, 3);
//   });
//   //you can't test the return value of the real function like this, only info about how it was called
// });

//if you want to have access to the methods of a mock function but want to also call the original function, use jest.spyOn(object, methodName)
//(comment out jest.mock() and test above for this to work)
describe("spy on function (with spyOn())", () => {
  test("multiplies two numbers", () => {
    const spy = jest.spyOn(math, "multiply");
    const res = printMultiplyAnswerMessage(2, 3);
    //test actual function
    expect(res).toBe("The answer is 6");
    //get data about how it was called
    expect(spy).toHaveBeenCalledWith(2, 3);
  });
});

//instad of using the spyOn method, you can just use jest.fn(originalFunction):
describe("spy on function (with jest.fn())", () => {
  test("multiplies two numbers", () => {
    math.multiply = jest.fn(math.multiply);
    const res = printMultiplyAnswerMessage(2, 3);
    expect(res).toBe("The answer is 6");
    expect(math.multiply).toHaveBeenCalledWith(2, 3);
  });
});

//you can also mock imported packages (e.g. axios) and provide "fake" responses (as seen before with fake promises)
jest.mock("axios");

it("fetches new post", async () => {
  const fakeResponse = {
    data: {
      title: "Mock Post",
      body: "This is the body of the mock post",
      author: "Dave",
    },
  };
  axios.get.mockResolvedValue(fakeResponse);
  //another way to do this is to create a mock axios call in a file called "axios" in a "mocks" folder that returns your mock data
  //jest will detect this file and will use that instead of real axios (no need to call jest.mock())
});

//JEST AND REACT

//to test React components with jest, you need to render the component
//you can do this by using ReactDOM or by using a library such as Enzyme or react-testing-library
//these libraries typically render the component in a simplified version of the dom (not in the browser)
//in addition to rendering your components, they also provide methods for querying elements and simulating events like clicks

//USING REACTDOM

describe("tests using ReactDOM", () => {
  test("renders without errors", () => {
    const container = document.createElement("div");
    ReactDOM.render(<MyComponent />, container);
    //assertion not necessary here because error would be thrown if couldn't render
  });
  test("renders 'no items' when no items are passed in", () => {
    const container = document.createElement("div");
    ReactDOM.render(<MyComponent items={[]} />, container);
    expect(container.textContent).toMatch("No items");
  });
  test("renders items when passed in", () => {
    const container = document.createElement("div");
    ReactDOM.render(
      <MyComponent items={["item1", "item2", "item3"]} />,
      container
    );
    expect(container.textContent).toMatch("item1");
    expect(container.textContent).toMatch("item2");
    expect(container.textContent).toMatch("item3");
  });
});

//USING ENZYME
//3 ways to render a component - shallow, mount or render
//shallow just renders that component (no children) and useEffect won't be called
//mount also renders children
//use the "find()" method to query elements by passing in an id, className, tag, attribute or component name (className not recommended)
//you can also combine these (as in CSS) e.g. find(header #title)
//you can also query components based on props e.g. find({name="George"})
//another useful selector is contains() which returns true if the component/element is found and false otherwise (must be element, not selector)

//with Enzyme, you need to also install the adapter for the version of react you're using
Enzyme.configure({ adapter: new Adapter() });

describe("tests using Enzyme", () => {
  //you can render the component once inside "describe" so you don't have to do it for each test
  const component = mount(<MyComponent />);
  it("renders without errors", () => {
    expect(component).toHaveLength(1);
  });
  it("contains a paragraph with text", () => {
    expect(component.contains(<p>Welcome</p>));
  });
  it("contains 3 span elements", () => {
    expect(component.find("span")).toHaveLength(3);
  });
  it("hides paragraph on button click", () => {
    const button = component.find(".myButton");
    button.simulate("click");
    const paragraph = component.find("p");
    expect(paragraph.length).toBe(0);
  });
  it("renders new list item", () => {
    const input = component.find("input");
    const form = component.find("form");
    //mock event object required as second arg
    input.simulate("change", { target: { value: "Charlie" } });
    form.simulate("submit");
    const listItems = component.find("li");
    expect(listItems).toHaveLength(1);
    //when you simulate a DOM event, Enzyme simply calls the element's relevant event handler (e.g. onClick)
    //in the example above, simulating a click on the button would have done nothing as the handler is on the form
  });
  it("displays the count", () => {
    const count = component.find(".count");
    expect(count.text()).toBe("0");
  });
  it("increments the count", () => {
    const incrementButton = component.find(".incrementButton");
    incrementButton.simulate("click");
    const count = component.find(".count");
    expect(count.text()).toBe("1");
  });
});

//USING REACT-TESTING-LIBRARY
//this library is supposed to make your tests more "user-centered" compared to Enzyme
//instead of querying elements by tag, classname etc, you can use: labelText, placeholderText, text, altText, title, displayValue, role (things a user can see) //you can also use testId (data attribute)
//this library is supposed to encourage you to make your site more accessible for users with screenreaders (by forcing you to use role, alt etc.)
//there's only one way to render a component (using "render")
//render returns an object with various properties, including queries, and it's recommended that you destructure what you need
//query methods are: getBy/getAllBy, queryBy/queryAllBy, findBy/findAllBy
//the difference is that getBy will throw an error if no element found, queryBy will return null and findBy always returns a promise
//for convenience, one of the library's exports is "screen", which you can use to query document.body
//screen also has a debug() method which will console log the DOM

describe("tests using react-testing-library", () => {
  it("renders without errors", () => {
    render(<MyComponent />);
  });
  it("contains a paragraph with text", () => {
    const { getByText } = render(<MyComponent />);
    expect(getByText("Welcome"));
  });
  it("contains 3 span elements", () => {
    const { queryAllByRole } = render(<MyComponent />);
    expect(queryAllByRole(""));
  });
  it("hides paragraph on button click", () => {
    const { queryByText } = render(<MyComponent />);
    fireEvent.click(queryByText("Toggle"));
    expect(queryByText("Welcome")).toBeNull();
  });
  it("renders new list item", () => {
    const { getByPlaceholderText, queryByText, queryAllByRole } = render(
      <MyComponent />
    );
    const input = getByPlaceholderText("Name...");
    // like Enzyme, you need to pass in mock event object
    fireEvent.change(input, { target: { value: "Sandy" } });
    //firing events actually fires the event (unlike in Enzyme) so, in this example, you can click the button (you could also fire the submit form event)
    fireEvent.click(queryByText("Add Name"));
    const listItems = queryAllByRole("listitem");
    expect(listItems).toHaveLength(1);
    //here you can see that you can sometimes choose between using a library's methods and just using the DOM property + jest (don't know if either is better)
    expect(listItems[0]).toHaveTextContent("Sandy");
    expect(listItems[0].textContent).toBe("Sandy");
  });
  it("displays the count", () => {
    const { queryByTestId } = render(<MyComponent />);
    const count = queryByTestId("count");
    expect(count).toHaveTextContent("0");
  });
  it("increments the count", () => {
    const { queryByText, queryByTestId } = render(<MyComponent />);
    const incrementButton = queryByText("Increase");
    fireEvent.click(incrementButton);
    const count = queryByTestId("count");
    expect(count).toHaveTextContent("1");
  });
  it("decrements the count after timeout", async () => {
    const { queryByText } = render(<MyComponent />);
    const decrementButton = queryByText("Decrease");
    fireEvent.click(decrementButton);
    //resolves promise once it finds element on page - very useful and, apparently, not possible with Enzyme (though there seems to be an npm package for this)
    expect(await waitForElement(() => queryByText("-1")));
  });
});

//USING PUPPETEER
//allows you to automate the browser in order to perform end-to-end tests
//headless mode can be toggled (headless is faster)
//sloMo option allows your to clearly see all actions in browser
//app must be running first (unlike for other types of tests)

describe("puppeteer tests", () => {
  test("can add name to list", async () => {
    const browser = await puppeteer.launch({
      headless: false,
      slowMo: 200,
    });
    const page = await browser.newPage();
    await page.goto("http://localhost:3000");
    await page.click("input#name");
    await page.type("input#name", "Harry");
    await page.click(".submitButton");
    //use .$eval to grab a particular element on the page
    const displayedName = await page.$eval(".name", (el) => el.textContent);
    expect(displayedName).toBe("Harry");
    //jest times out after 5 seconds by default but puppeteer will take longer in non-headless mode so you need to set limit higher
  }, 60000);
});

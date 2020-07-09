import React, { useState } from "react";
import axios from "axios";

const MyComponent = ({ items }) => {
  const [isShown, setIsShown] = useState(true);
  const [names, setNames] = useState([]);
  const [nameInput, setNameInput] = useState("");
  const [count, setCount] = useState(0);
  const [posts, setPosts] = useState([]);

  const handleAddName = (e) => {
    e.preventDefault();
    setNames([...names, nameInput]);
    e.target.reset();
  };

  const handleChange = (e) => {
    setNameInput(e.target.value);
  };

  const increment = () => {
    setCount(count + 1);
  };

  const decrement = () => {
    setTimeout(() => {
      setCount(count - 1);
    }, 250);
  };

  const handleAddPost = () => {
    axios
      .get("http://localhost:5000/createPost")
      .then((res) => {
        setPosts([...posts, res.data]);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  return (
    <div>
      <div>
        <span>1</span>
        <span>2</span>
        <span>3</span>
      </div>
      <div>
        {items && items.length > 0 ? (
          items.map((item, index) => <span key={index}>{item}</span>)
        ) : (
          <h1>No items</h1>
        )}
      </div>
      <button className="myButton" onClick={() => setIsShown(!isShown)}>
        Toggle
      </button>
      {isShown && <p>Welcome</p>}
      <form onSubmit={handleAddName} data-testid="my-form">
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          placeholder="Name..."
          value={nameInput}
          onChange={handleChange}
        />
        <button type="submit" className="submitButton">
          Add Name
        </button>
      </form>
      <ul className="names">
        {names.map((name, index) => (
          <li key={index} className="name">
            {name}
          </li>
        ))}
      </ul>
      <div>
        <h1 className="count" data-testid="count">
          {count}
        </h1>
        <button onClick={increment} className="incrementButton">
          Increase
        </button>
        <button onClick={decrement} className="decrementButton">
          Decrease
        </button>
      </div>
      <button onClick={handleAddPost}>Add Post</button>
      <div>
        {posts.map((post, index) => (
          <div key={index} data-testid="post">
            <h2>{post.title}</h2>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyComponent;

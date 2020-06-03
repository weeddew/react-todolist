import React from "react";

const TodoListItem = ({ todo, onRemove, onToggle }) => {
  const { id, text, checked } = todo;

  return (
    <div>
      <input
        type="checkbox"
        name="checked"
        defaultChecked={checked}
        onClick={() => onToggle(id)}
      />
      <label style={{ textDecoration: checked ? "line-through" : "none" }}>
        {text}
      </label>
      <input type="button" value="delete" onClick={() => onRemove(id)} />
    </div>
  );
};

export default TodoListItem;

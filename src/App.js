import React, { useState, useRef, useCallback, useEffect } from "react";
import TodoTemplate from "./components/TodoTemplate";
import TodoInsert from "./components/TodoInsert";
import TodoList from "./components/TodoList";
import { Subject, BehaviorSubject, of } from "rxjs";
import { scan, publishReplay, refCount, map } from "rxjs/operators";

class TodoService {
  constructor(initialTodos) {
    this.nextId = initialTodos.length + 1;
    this.update$ = new BehaviorSubject((todos) => todos);
    this.create$ = new Subject();
    this.remove$ = new Subject();
    this.toggle$ = new Subject();

    this.todos$ = this.update$.pipe(
      scan((todos, operation) => operation(todos), initialTodos),
      publishReplay(1),
      refCount()
    );

    this.create$
      .pipe(map((todo) => (todos) => todos.concat(todo)))
      .subscribe(this.update$);

    this.remove$
      .pipe(map((id) => (todos) => todos.filter((todo) => todo.id !== id)))
      .subscribe(this.update$);

    this.toggle$
      .pipe(
        map((id) => (todos) =>
          todos.map((todo) =>
            todo.id === id ? { ...todo, checked: !todo.checked } : todo
          )
        )
      )
      .subscribe(this.update$);
  }

  bind(func) {
    this.todos$.subscribe(func);
  }

  unbind() {
    this.todos$.unsubscribe();
  }

  add(text) {
    const todo = {
      id: this.nextId, // TODO
      text,
      checked: false,
    };

    this.create$.next(todo);
    this.nextId++;
  }

  remove(id) {
    this.remove$.next(id);
  }

  toggle(id) {
    this.toggle$.next(id);
  }
}

function App() {
  // 할 일 목록
  const [todos, setTodos] = useState([]);

  const todoService = useRef(null);

  useEffect(() => {
    todoService.current = new TodoService([
      {
        id: 1,
        text: "리액트의 기초 알아보기",
        checked: true,
      },
      {
        id: 2,
        text: "컴포넌트 스타일링해 보기",
        checked: true,
      },
      {
        id: 3,
        text: "일정 관리 앱 만들어 보기",
        checked: false,
      },
    ]);

    todoService.current.bind((todos) => setTodos(todos));

    return () => {
      todoService.current.unbind();
    };
  }, []);

  // 할 일 추가
  const onInsert = useCallback((text) => {
    todoService.current.add(text);
  }, []);

  // 할 일 삭제
  const onRemove = useCallback((id) => {
    todoService.current.remove(id);
  }, []);

  // 할 일 수정
  const onToggle = useCallback((id) => {
    todoService.current.toggle(id);
  }, []);

  return (
    <TodoTemplate>
      <TodoInsert onInsert={onInsert} />
      <hr />
      <TodoList todos={todos} onRemove={onRemove} onToggle={onToggle} />
    </TodoTemplate>
  );
}

export default App;

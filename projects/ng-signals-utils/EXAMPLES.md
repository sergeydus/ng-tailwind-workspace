# @sergeydus/ng-signals-utils - Examples

Comprehensive examples for all utility functions in the @sergeydus/ng-signals-utils package.

## Table of Contents

- [Signal Transformations](#signal-transformations)
- [Array Utilities](#array-utilities)
- [Object Utilities](#object-utilities)
- [Effect Helpers](#effect-helpers)

---

## Signal Transformations

### mapSignal

Transform a signal value to another type.

```typescript
import { signal } from '@angular/core';
import { mapSignal } from '@sergeydus/ng-signals-utils';

// Basic number transformation
const count = signal(5);
const doubled = mapSignal(count, (x) => x * 2);
console.log(doubled()); // 10

count.set(10);
console.log(doubled()); // 20

// String transformation
const name = signal('john');
const uppercase = mapSignal(name, (n) => n.toUpperCase());
console.log(uppercase()); // 'JOHN'

// Object transformation
const user = signal({ firstName: 'John', lastName: 'Doe' });
const fullName = mapSignal(user, (u) => `${u.firstName} ${u.lastName}`);
console.log(fullName()); // 'John Doe'
```

### filterSignal

Filter signal updates based on a predicate.

```typescript
import { signal } from '@angular/core';
import { filterSignal } from '@sergeydus/ng-signals-utils';

// Only allow positive numbers
const input = signal(0);
const positive = filterSignal(input, (x) => x > 0, 0);

input.set(-5);
console.log(positive()); // 0 (filtered out)

input.set(10);
console.log(positive()); // 10

input.set(-3);
console.log(positive()); // 10 (still 10, -3 was filtered)

// Filter strings by length
const text = signal('');
const validText = filterSignal(text, (t) => t.length >= 3, '');

text.set('ab');
console.log(validText()); // '' (too short)

text.set('hello');
console.log(validText()); // 'hello'
```

### debounceSignal

Debounce signal updates by a specified delay.

```typescript
import { signal } from '@angular/core';
import { debounceSignal } from '@sergeydus/ng-signals-utils';

const searchTerm = signal('');
const debouncedSearch = debounceSignal(searchTerm, 300);

// Perfect for search inputs
@Component({
  selector: 'app-search',
  template: `
    <input [value]="searchTerm()" (input)="onSearch($event)" />
    <p>Debounced: {{ debouncedSearch() }}</p>
  `
})
export class SearchComponent {
  searchTerm = signal('');
  debouncedSearch = debounceSignal(this.searchTerm, 300);
  
  onSearch(event: Event) {
    this.searchTerm.set((event.target as HTMLInputElement).value);
  }
}
```

### combineSignals

Combine multiple signals into a single signal.

```typescript
import { signal } from '@angular/core';
import { combineSignals } from '@sergeydus/ng-signals-utils';

const firstName = signal('John');
const lastName = signal('Doe');
const age = signal(30);

const combined = combineSignals([firstName, lastName, age]);
console.log(combined()); // ['John', 'Doe', 30]

firstName.set('Jane');
console.log(combined()); // ['Jane', 'Doe', 30]

// Use in templates
@Component({
  selector: 'app-user',
  template: `
    <div>
      @let [first, last, userAge] = userInfo();
      <p>Name: {{ first }} {{ last }}</p>
      <p>Age: {{ userAge }}</p>
    </div>
  `
})
export class UserComponent {
  firstName = signal('John');
  lastName = signal('Doe');
  age = signal(30);
  userInfo = combineSignals([this.firstName, this.lastName, this.age]);
}
```

### distinctSignal

Emit only distinct values from a signal.

```typescript
import { signal } from '@angular/core';
import { distinctSignal } from '@sergeydus/ng-signals-utils';

// With primitive values
const value = signal(1);
const distinct = distinctSignal(value);

value.set(1); // No change
value.set(1); // No change
value.set(2); // Changes to 2
console.log(distinct()); // 2

// With custom comparator for objects
const user = signal({ id: 1, name: 'John' });
const distinctUser = distinctSignal(
  user,
  (a, b) => a.id === b.id
);

user.set({ id: 1, name: 'John Doe' }); // No change (same id)
user.set({ id: 2, name: 'Jane' }); // Changes
```

---

## Array Utilities

### arraySignalPush

Add items to an array signal.

```typescript
import { signal } from '@angular/core';
import { arraySignalPush } from '@sergeydus/ng-signals-utils';

const todos = signal<string[]>([]);

arraySignalPush(todos, 'Buy groceries');
arraySignalPush(todos, 'Walk the dog');
console.log(todos()); // ['Buy groceries', 'Walk the dog']

// In a component
@Component({
  selector: 'app-todo-list',
  template: `
    <input #input />
    <button (click)="addTodo(input.value)">Add</button>
    <ul>
      @for (todo of todos(); track $index) {
        <li>{{ todo }}</li>
      }
    </ul>
  `
})
export class TodoListComponent {
  todos = signal<string[]>([]);
  
  addTodo(text: string) {
    arraySignalPush(this.todos, text);
  }
}
```

### arraySignalRemoveAt

Remove an item from an array signal by index.

```typescript
import { signal } from '@angular/core';
import { arraySignalRemoveAt } from '@sergeydus/ng-signals-utils';

const items = signal(['a', 'b', 'c', 'd']);

arraySignalRemoveAt(items, 1); // Remove 'b'
console.log(items()); // ['a', 'c', 'd']

arraySignalRemoveAt(items, 0); // Remove 'a'
console.log(items()); // ['c', 'd']

// Remove by index in component
@Component({
  template: `
    <ul>
      @for (item of items(); track $index) {
        <li>
          {{ item }}
          <button (click)="remove($index)">Remove</button>
        </li>
      }
    </ul>
  `
})
export class ListComponent {
  items = signal(['Item 1', 'Item 2', 'Item 3']);
  
  remove(index: number) {
    arraySignalRemoveAt(this.items, index);
  }
}
```

### arraySignalFilter

Create a computed signal with filtered array.

```typescript
import { signal } from '@angular/core';
import { arraySignalFilter } from '@sergeydus/ng-signals-utils';

const numbers = signal([1, 2, 3, 4, 5, 6]);
const evenNumbers = arraySignalFilter(numbers, (n) => n % 2 === 0);
console.log(evenNumbers()); // [2, 4, 6]

numbers.set([1, 2, 3, 4, 5, 6, 7, 8]);
console.log(evenNumbers()); // [2, 4, 6, 8]

// Filter objects
interface Task {
  id: number;
  title: string;
  completed: boolean;
}

const tasks = signal<Task[]>([
  { id: 1, title: 'Task 1', completed: true },
  { id: 2, title: 'Task 2', completed: false },
  { id: 3, title: 'Task 3', completed: true }
]);

const completedTasks = arraySignalFilter(tasks, (t) => t.completed);
const pendingTasks = arraySignalFilter(tasks, (t) => !t.completed);
```

### arraySignalMap

Create a computed signal with mapped array.

```typescript
import { signal } from '@angular/core';
import { arraySignalMap } from '@sergeydus/ng-signals-utils';

const numbers = signal([1, 2, 3, 4]);
const squared = arraySignalMap(numbers, (n) => n * n);
console.log(squared()); // [1, 4, 9, 16]

// Map objects to strings
interface User {
  id: number;
  name: string;
  email: string;
}

const users = signal<User[]>([
  { id: 1, name: 'John', email: 'john@example.com' },
  { id: 2, name: 'Jane', email: 'jane@example.com' }
]);

const userNames = arraySignalMap(users, (u) => u.name);
console.log(userNames()); // ['John', 'Jane']

const userLabels = arraySignalMap(users, (u, i) => `${i + 1}. ${u.name}`);
console.log(userLabels()); // ['1. John', '2. Jane']
```

### arraySignalSort

Create a computed signal with sorted array.

```typescript
import { signal } from '@angular/core';
import { arraySignalSort } from '@sergeydus/ng-signals-utils';

// Sort numbers
const numbers = signal([5, 2, 8, 1, 9]);
const sorted = arraySignalSort(numbers);
console.log(sorted()); // [1, 2, 5, 8, 9]

// Sort with custom comparator
const descending = arraySignalSort(numbers, (a, b) => b - a);
console.log(descending()); // [9, 8, 5, 2, 1]

// Sort objects
interface Product {
  name: string;
  price: number;
}

const products = signal<Product[]>([
  { name: 'Laptop', price: 999 },
  { name: 'Mouse', price: 25 },
  { name: 'Keyboard', price: 75 }
]);

const byPrice = arraySignalSort(products, (a, b) => a.price - b.price);
const byName = arraySignalSort(products, (a, b) => a.name.localeCompare(b.name));
```

### arraySignalFind

Find an item in an array signal.

```typescript
import { signal } from '@angular/core';
import { arraySignalFind } from '@sergeydus/ng-signals-utils';

const users = signal([
  { id: 1, name: 'John' },
  { id: 2, name: 'Jane' },
  { id: 3, name: 'Bob' }
]);

const userById = arraySignalFind(users, (u) => u.id === 2);
console.log(userById()); // { id: 2, name: 'Jane' }

const userByName = arraySignalFind(users, (u) => u.name === 'Bob');
console.log(userByName()); // { id: 3, name: 'Bob' }

// Dynamic find
@Component({
  template: `
    <input #search />
    <button (click)="searchId.set(+search.value)">Search</button>
    @if (foundUser(); as user) {
      <p>Found: {{ user.name }}</p>
    } @else {
      <p>User not found</p>
    }
  `
})
export class UserSearchComponent {
  users = signal([/* ... */]);
  searchId = signal(0);
  foundUser = computed(() => 
    this.users().find(u => u.id === this.searchId())
  );
}
```

### arraySignalLength

Get the length of an array signal.

```typescript
import { signal } from '@angular/core';
import { arraySignalLength } from '@sergeydus/ng-signals-utils';

const items = signal([1, 2, 3, 4, 5]);
const count = arraySignalLength(items);
console.log(count()); // 5

items.set([1, 2, 3]);
console.log(count()); // 3

// Display count in template
@Component({
  template: `
    <p>Total items: {{ itemCount() }}</p>
    <ul>
      @for (item of items(); track item) {
        <li>{{ item }}</li>
      }
    </ul>
  `
})
export class ItemsComponent {
  items = signal([1, 2, 3, 4, 5]);
  itemCount = arraySignalLength(this.items);
}
```

### arraySignalIsEmpty

Check if an array signal is empty.

```typescript
import { signal } from '@angular/core';
import { arraySignalIsEmpty } from '@sergeydus/ng-signals-utils';

const todos = signal<string[]>([]);
const isEmpty = arraySignalIsEmpty(todos);
console.log(isEmpty()); // true

arraySignalPush(todos, 'Do something');
console.log(isEmpty()); // false

// Use in template
@Component({
  template: `
    @if (isEmpty()) {
      <p>No items to display</p>
    } @else {
      <ul>
        @for (item of items(); track $index) {
          <li>{{ item }}</li>
        }
      </ul>
    }
  `
})
export class ListComponent {
  items = signal<string[]>([]);
  isEmpty = arraySignalIsEmpty(this.items);
}
```

---

## Object Utilities

### patchSignal

Update an object signal with partial values.

```typescript
import { signal } from '@angular/core';
import { patchSignal } from '@sergeydus/ng-signals-utils';

interface User {
  id: number;
  name: string;
  email: string;
  age: number;
}

const user = signal<User>({
  id: 1,
  name: 'John',
  email: 'john@example.com',
  age: 30
});

// Update only specific fields
patchSignal(user, { name: 'John Doe' });
console.log(user()); // { id: 1, name: 'John Doe', email: 'john@example.com', age: 30 }

patchSignal(user, { email: 'johndoe@example.com', age: 31 });
console.log(user()); 
// { id: 1, name: 'John Doe', email: 'johndoe@example.com', age: 31 }

// Use in a form
@Component({
  template: `
    <form>
      <input [value]="user().name" (input)="updateName($event)" />
      <input [value]="user().email" (input)="updateEmail($event)" />
    </form>
  `
})
export class UserFormComponent {
  user = signal({ id: 1, name: '', email: '' });
  
  updateName(event: Event) {
    patchSignal(this.user, { 
      name: (event.target as HTMLInputElement).value 
    });
  }
  
  updateEmail(event: Event) {
    patchSignal(this.user, { 
      email: (event.target as HTMLInputElement).value 
    });
  }
}
```

### pickSignal

Pick specific keys from an object signal.

```typescript
import { signal } from '@angular/core';
import { pickSignal } from '@sergeydus/ng-signals-utils';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  role: string;
}

const user = signal<User>({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  role: 'admin'
});

// Pick only safe fields for display
const publicUser = pickSignal(user, 'id', 'name', 'email');
console.log(publicUser()); 
// { id: 1, name: 'John Doe', email: 'john@example.com' }

// Pick credentials
const credentials = pickSignal(user, 'email', 'password');
console.log(credentials()); 
// { email: 'john@example.com', password: 'secret123' }
```

### omitSignal

Omit specific keys from an object signal.

```typescript
import { signal } from '@angular/core';
import { omitSignal } from '@sergeydus/ng-signals-utils';

interface User {
  id: number;
  name: string;
  email: string;
  password: string;
  createdAt: Date;
}

const user = signal<User>({
  id: 1,
  name: 'John Doe',
  email: 'john@example.com',
  password: 'secret123',
  createdAt: new Date()
});

// Omit sensitive fields
const safeUser = omitSignal(user, 'password');
console.log(safeUser()); 
// { id: 1, name: 'John Doe', email: 'john@example.com', createdAt: Date }

// Omit multiple fields
const minimalUser = omitSignal(user, 'password', 'createdAt');
console.log(minimalUser()); 
// { id: 1, name: 'John Doe', email: 'john@example.com' }
```

### pluckSignal

Extract a single property from an object signal.

```typescript
import { signal } from '@angular/core';
import { pluckSignal } from '@sergeydus/ng-signals-utils';

interface Product {
  id: number;
  name: string;
  price: number;
  stock: number;
}

const product = signal<Product>({
  id: 1,
  name: 'Laptop',
  price: 999,
  stock: 15
});

const productName = pluckSignal(product, 'name');
console.log(productName()); // 'Laptop'

const price = pluckSignal(product, 'price');
console.log(price()); // 999

// Use in template
@Component({
  template: `
    <h2>{{ productName() }}</h2>
    <p>Price: ${{ price() }}</p>
    <p>In stock: {{ stock() }}</p>
  `
})
export class ProductComponent {
  product = signal({ id: 1, name: 'Laptop', price: 999, stock: 15 });
  productName = pluckSignal(this.product, 'name');
  price = pluckSignal(this.product, 'price');
  stock = pluckSignal(this.product, 'stock');
}
```

### objectSignalKeys

Get the keys of an object signal.

```typescript
import { signal } from '@angular/core';
import { objectSignalKeys } from '@sergeydus/ng-signals-utils';

const settings = signal({
  theme: 'dark',
  language: 'en',
  notifications: true
});

const keys = objectSignalKeys(settings);
console.log(keys()); // ['theme', 'language', 'notifications']

// Use to iterate over object properties
@Component({
  template: `
    <ul>
      @for (key of settingKeys(); track key) {
        <li>{{ key }}: {{ settings()[key] }}</li>
      }
    </ul>
  `
})
export class SettingsComponent {
  settings = signal({ theme: 'dark', language: 'en' });
  settingKeys = objectSignalKeys(this.settings);
}
```

### objectSignalValues

Get the values of an object signal.

```typescript
import { signal } from '@angular/core';
import { objectSignalValues } from '@sergeydus/ng-signals-utils';

const scores = signal({
  math: 95,
  english: 87,
  science: 92
});

const values = objectSignalValues(scores);
console.log(values()); // [95, 87, 92]

// Calculate average
const average = computed(() => {
  const vals = objectSignalValues(scores)();
  return vals.reduce((a, b) => a + b, 0) / vals.length;
});
console.log(average()); // 91.33
```

### objectSignalEntries

Get the entries of an object signal.

```typescript
import { signal } from '@angular/core';
import { objectSignalEntries } from '@sergeydus/ng-signals-utils';

const user = signal({
  name: 'John',
  age: 30,
  city: 'New York'
});

const entries = objectSignalEntries(user);
console.log(entries()); 
// [['name', 'John'], ['age', 30], ['city', 'New York']]

// Display as key-value pairs
@Component({
  template: `
    <dl>
      @for (entry of userEntries(); track entry[0]) {
        <dt>{{ entry[0] }}</dt>
        <dd>{{ entry[1] }}</dd>
      }
    </dl>
  `
})
export class UserDetailsComponent {
  user = signal({ name: 'John', age: 30, city: 'New York' });
  userEntries = objectSignalEntries(this.user);
}
```

---

## Effect Helpers

### watchSignal

Create an effect that tracks value changes with previous value.

```typescript
import { signal } from '@angular/core';
import { watchSignal } from '@sergeydus/ng-signals-utils';

const count = signal(0);

watchSignal(count, (current, previous) => {
  console.log(`Changed from ${previous} to ${current}`);
});

count.set(1); // "Changed from 0 to 1"
count.set(5); // "Changed from 1 to 5"

// Track user changes for logging
@Component({})
export class UserComponent implements OnInit {
  user = signal({ id: 1, name: 'John' });
  
  ngOnInit() {
    watchSignal(this.user, (current, previous) => {
      console.log('User updated:', {
        from: previous,
        to: current
      });
      // Log to analytics, save to history, etc.
    });
  }
}
```

### watchUntil

Create an effect that runs once when a condition is met.

```typescript
import { signal } from '@angular/core';
import { watchUntil } from '@sergeydus/ng-signals-utils';

const loading = signal(true);
const data = signal<any>(null);

// Wait for data to load
watchUntil(
  data,
  (value) => value !== null,
  (value) => {
    console.log('Data loaded:', value);
    // Perform one-time initialization
  }
);

// Wait for specific condition
const userAge = signal(0);
watchUntil(
  userAge,
  (age) => age >= 18,
  (age) => {
    console.log('User is now an adult:', age);
    // Show adult content, unlock features, etc.
  }
);

// Wait for authentication
@Component({})
export class AppComponent implements OnInit {
  isAuthenticated = signal(false);
  
  ngOnInit() {
    watchUntil(
      this.isAuthenticated,
      (auth) => auth === true,
      () => {
        console.log('User authenticated, loading data...');
        this.loadUserData();
      }
    );
  }
}
```

### throttleEffect

Create a throttled effect that runs at most once per time interval.

```typescript
import { signal } from '@angular/core';
import { throttleEffect } from '@sergeydus/ng-signals-utils';

// Throttle scroll events
const scrollY = signal(0);

throttleEffect(
  scrollY,
  (y) => {
    console.log('Scroll position:', y);
    // Update UI, check visibility, etc.
  },
  100 // Run at most once every 100ms
);

// Throttle mouse movements
@Component({
  template: `
    <div 
      (mousemove)="onMouseMove($event)"
      style="width: 100%; height: 500px; background: #f0f0f0">
      Mouse: {{ mouseX() }}, {{ mouseY() }}
    </div>
  `
})
export class MouseTrackerComponent implements OnInit {
  mouseX = signal(0);
  mouseY = signal(0);
  
  ngOnInit() {
    throttleEffect(
      this.mouseX,
      (x) => {
        console.log('Throttled X update:', x);
      },
      200
    );
  }
  
  onMouseMove(event: MouseEvent) {
    this.mouseX.set(event.clientX);
    this.mouseY.set(event.clientY);
  }
}
```

### debounceEffect

Create a debounced effect that waits for changes to stop.

```typescript
import { signal } from '@angular/core';
import { debounceEffect } from '@sergeydus/ng-signals-utils';

// Debounce search API calls
const searchQuery = signal('');

debounceEffect(
  searchQuery,
  (query) => {
    if (query.length >= 3) {
      console.log('Searching for:', query);
      // Make API call
    }
  },
  300 // Wait 300ms after typing stops
);

// Auto-save form data
@Component({
  template: `
    <textarea 
      [value]="content()" 
      (input)="onInput($event)"
      placeholder="Type something...">
    </textarea>
    <p>{{ saveStatus() }}</p>
  `
})
export class EditorComponent implements OnInit {
  content = signal('');
  saveStatus = signal('All changes saved');
  
  ngOnInit() {
    debounceEffect(
      this.content,
      (text) => {
        this.saveStatus.set('Saving...');
        // Save to server
        setTimeout(() => {
          this.saveStatus.set('All changes saved');
        }, 500);
      },
      1000 // Wait 1 second after typing stops
    );
  }
  
  onInput(event: Event) {
    this.content.set((event.target as HTMLTextAreaElement).value);
    this.saveStatus.set('Unsaved changes');
  }
}
```

---

## Complete Examples

### Todo App with Signals

```typescript
import { Component, signal } from '@angular/core';
import {
  arraySignalPush,
  arraySignalRemoveAt,
  arraySignalFilter,
  arraySignalLength,
  arraySignalIsEmpty
} from '@sergeydus/ng-signals-utils';

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

@Component({
  selector: 'app-todo',
  template: `
    <div>
      <input #input placeholder="Add todo..." />
      <button (click)="addTodo(input.value); input.value = ''">Add</button>
      
      <p>Total: {{ totalCount() }} | Completed: {{ completedCount() }}</p>
      
      @if (isEmpty()) {
        <p>No todos yet!</p>
      } @else {
        <ul>
          @for (todo of todos(); track todo.id) {
            <li>
              <input 
                type="checkbox" 
                [checked]="todo.completed"
                (change)="toggleTodo(todo.id)" />
              <span [style.text-decoration]="todo.completed ? 'line-through' : 'none'">
                {{ todo.text }}
              </span>
              <button (click)="removeTodo(todo.id)">Delete</button>
            </li>
          }
        </ul>
      }
    </div>
  `
})
export class TodoAppComponent {
  todos = signal<Todo[]>([]);
  nextId = 1;
  
  isEmpty = arraySignalIsEmpty(this.todos);
  totalCount = arraySignalLength(this.todos);
  completedCount = computed(() => 
    this.todos().filter(t => t.completed).length
  );
  
  addTodo(text: string) {
    if (text.trim()) {
      arraySignalPush(this.todos, {
        id: this.nextId++,
        text: text.trim(),
        completed: false
      });
    }
  }
  
  removeTodo(id: number) {
    const index = this.todos().findIndex(t => t.id === id);
    if (index !== -1) {
      arraySignalRemoveAt(this.todos, index);
    }
  }
  
  toggleTodo(id: number) {
    this.todos.update(todos =>
      todos.map(t => t.id === id ? { ...t, completed: !t.completed } : t)
    );
  }
}
```

### User Profile with Object Utilities

```typescript
import { Component, signal } from '@angular/core';
import { patchSignal, pickSignal, pluckSignal } from '@sergeydus/ng-signals-utils';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  avatar: string;
  bio: string;
  settings: {
    theme: string;
    notifications: boolean;
  };
}

@Component({
  selector: 'app-profile',
  template: `
    <div>
      <h2>{{ userName() }}</h2>
      <img [src]="avatar()" alt="Avatar" />
      
      <form>
        <input 
          [value]="profile().name" 
          (input)="updateField('name', $event)" 
          placeholder="Name" />
        <input 
          [value]="profile().email" 
          (input)="updateField('email', $event)" 
          placeholder="Email" />
        <textarea 
          [value]="profile().bio" 
          (input)="updateField('bio', $event)" 
          placeholder="Bio">
        </textarea>
      </form>
      
      <button (click)="saveProfile()">Save</button>
    </div>
  `
})
export class UserProfileComponent {
  profile = signal<UserProfile>({
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    avatar: '/avatar.jpg',
    bio: 'Software developer',
    settings: {
      theme: 'dark',
      notifications: true
    }
  });
  
  // Extract specific fields for easy access
  userName = pluckSignal(this.profile, 'name');
  avatar = pluckSignal(this.profile, 'avatar');
  
  // Public profile without sensitive data
  publicProfile = pickSignal(this.profile, 'name', 'avatar', 'bio');
  
  updateField(field: keyof UserProfile, event: Event) {
    const value = (event.target as HTMLInputElement).value;
    patchSignal(this.profile, { [field]: value } as Partial<UserProfile>);
  }
  
  saveProfile() {
    const data = this.publicProfile();
    console.log('Saving:', data);
    // API call to save profile
  }
}
```

---

## Best Practices

1. **Use computed signals** for derived state instead of effects when possible
2. **Debounce expensive operations** like API calls and complex computations
3. **Keep signals focused** - one signal per piece of state
4. **Leverage array utilities** instead of manual array manipulation
5. **Use watchSignal** when you need to compare current and previous values
6. **Clean up effects** by calling `.destroy()` when components are destroyed
7. **Type your signals** properly for better TypeScript support

For more information, visit the [GitHub repository](https://github.com/yourusername/ng-signals-utils).


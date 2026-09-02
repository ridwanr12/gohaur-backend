import { getAllUsers } from '/Users/chordan/Programming/Skripsi Iwang/gohaur-backend/src/services/userService.js';

const data = await getAllUsers({search: "seller"});

export function getUserTest(id) {
    return {
      id,
      name: "John Doe",
      email: `user${id}@example.com`,
      age: 25,
      active: true,
    };
  }
  

// console.log(getUser(1));


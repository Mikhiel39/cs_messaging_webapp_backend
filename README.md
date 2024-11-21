# CS Messaging App
It's a real-time chat application for multiple agents who provide support to multiple customers who can create queries and then some agent will be alloted to a query to solve issue by real time messaging with that customer. It also tag urgent messages based on important strings appearing in their chats.

## Implemented features
- Scheme to help agents divide work amongst themselves & to prevent multiple agents working on the same message at once.
- To surface messages that are more urgent and in need of immediate attention using "Urgent" tag.
- Search functionality to allow agents to search over messages and customers.
- To surface additional information about customers.
- Using socket.io, so that new incoming messages can show up in real time

## How to run 

Both server & frontend App are hosted on:

- client: [cs-messaging-webapp-frontend-hs9ikli9d.vercel.app](cs-messaging-webapp-frontend-hs9ikli9d.vercel.app)
- server: [https://cs-messaging-webapp-backend.onrender.com](https://cs-messaging-webapp-backend.onrender.com)

### Running Locally

#### Clone repo Backend
    
    git clone https://github.com/Mikhiel39/cs_messaging_webapp_backend
   

#### To run Server
In the directory, "cs_messaging_webapp_backend":

- Install all packages for the server, run command 
    ```
    npm install
    ```

- Then, to run server, run command
    ```
    npm start
    ```

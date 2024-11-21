# CS Messaging App
It's a real-time chat application for multiple agents who provide support to multiple customers who can create queries and then some agent will be alloted to a query to solve issue by real time messaging with that customer. It also tag urgent messages based on important strings appearing in their chats.
## Implemented features
- Scheme to help agents divide work amongst themselves & to prevent multiple agents working on the same message at once.
- To surface messages that are more urgent and in need of immediate attention using "Urgent" tag.
- Search functionality to allow agents to search over messages and customers.
- To surface additional information about customers.
- Using socket.io, so that new incoming messages can show up in real time.

## How to run 

Both server & frontend App are hosted on:

- client: [https://admirable-caramel-5b6f46.netlify.app](https://admirable-caramel-5b6f46.netlify.app)
- server: [https://cs-mesaging-app.onrender.com](https://cs-mesaging-app.onrender.com)
- postman APIs collection: [https://www.postman.com/...](https://www.postman.com/planetary-equinox-821652/workspace/branch-assignment-by-rachit-goel/collection/19949199-eb06d1c9-411a-4dc4-9798-f9d51adc7a9c?action=share&creator=19949199) You can set environment as heroku server or local server.

### Running Locally

#### Clone repo 
    
    git clone https://github.com/Rachit-Goel/cs-messaging-app.git
   

#### To run Server
In the directory, "cs-messaging-app-master":

- Install all packages for the server, run command 
    ```
    npm install
    ```

- Then, to run server, run command
    ```
    npm start
    ```


#### To run Frontend - WebApp
- In another terminal, come inside the directory, "cs-messaging-app-master/client":
    ```
    cd client
    ```

- Install all packages for the client, run command 
    ```
    npm install
    ```

- In file- "cs-messaging-app-master/client/src/index.js" : 
    To use local server url - uncomment the line 11 and comment the line 9.

- Then, to run WebApp, run command
    ```
    npm start
    ```



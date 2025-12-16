import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "./Login";
import Dashboard from "./Dashboard";
import ProtectedRoute from "./ProtectedRoute";
import AddGuestForm from "./AddGuest";
import ManageGuest from "./ManageGuest";
import GuestProfile from "./GuestProfile";
import NewPost from "./NewPost";
import Blogs from "./Blogs"
import AddBlogs from "./AddBlogs";
import AddDepartmentModal from "./ViewBlog";
import Register from "./Register"
import EditBlog from "./EditBlog";
import ManageBlog from "./ManageBlog";


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/dashboard"
          element={
              <Dashboard />
          }
        />
        <Route path="/guest"
          element={
              <AddGuestForm />
          }
        />
        <Route path="/register"
          element={
              <Register/>
          }
        />
        <Route path="/manage-guest"
          element={
              <ManageGuest />
          }
        />
        <Route path="/manage-guest/profile"
          element={
              <GuestProfile />
          }
        />
        <Route path="/new-post"
          element={
              <NewPost />
          }
        />
        <Route path="/blogs"
          element={
              <Blogs/>
          }
        />
        <Route path="/add-blog"
          element={
              <AddBlogs/>
          }
        />
        <Route path="/"
          element={
              <AddDepartmentModal/>
          }
        />
                <Route path="/edit-blog/:id" element={<EditBlog/>} />
                <Route path="/manage-blog" element={<ManageBlog/>} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;

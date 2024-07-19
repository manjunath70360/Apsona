import {Route, Switch, BrowserRouter, Redirect} from 'react-router-dom'

import Login from "./components/login"
import Home from './components/home'

import ArchivedNotes from './components/todo/ArchivedNotes'
import TrashedNotes from './components/todo/TrashedNotes'
import TagView from './components/todo/TagView'
import ReminderView from './components/todo/RemainderView'

import NotFound from './components/notfound'
import ProtectedRoute from './components/protectedRoute'
import "./App.css"

const App = ()=> {
return(
      <BrowserRouter>
      <Switch>
          <Route exact path="/" component={Login} />
       
          <ProtectedRoute path="/archived" component={ArchivedNotes} />
        <ProtectedRoute path="/trashed" component={TrashedNotes} />
        <ProtectedRoute path="/tag/:tag" component={TagView} />
        <ProtectedRoute path="/reminders" component={ReminderView} />
        <ProtectedRoute path="/home" component={Home} />

          <Route path="/not-found" component={NotFound} />
          <Redirect to="not-found" />
      </Switch>
      </BrowserRouter>
)
}

export default App;
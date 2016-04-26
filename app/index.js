require('expose?$!expose?jQuery!jquery');
require("bootstrap-webpack");
require('./index.css');
import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';

import App from './components/App.jsx';
import Home from './pages/Home.jsx';
import Model from './pages/Model.jsx';


ReactDom.render((
	<Router history={browserHistory}>
		<Route component={App}>
			<Route path="/" component={Home}/>
			<Route path="/user/:username" component={Model}/>
		</Route>
	</Router>
), document.getElementById('app'))
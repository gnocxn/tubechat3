require('expose?$!expose?jQuery!jquery');
require("bootstrap-webpack");
require('./index.css');
import React from 'react';
import ReactDom from 'react-dom';
import { Router, Route, browserHistory } from 'react-router';
import createBrowserHistory from 'history/lib/createBrowserHistory'
import useScroll from 'scroll-behavior/lib/useStandardScroll'
const history = useScroll(createBrowserHistory)()

import App from './components/App.jsx';
import Home from './pages/Home.jsx';
import Model from './pages/Model.jsx';

ReactDom.render((
	<Router history={history}>
		<Route component={App}>
			<Route path="/" component={Home}/>
			<Route onUpdate={() => window.scrollTo(0, 0)} path="/user/:username" component={Model}/>
		</Route>
	</Router>
), document.getElementById('app'))
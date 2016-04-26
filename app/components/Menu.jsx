import React from 'react';

let {EventEmitter} = require('fbemitter');
window.emitter = new EventEmitter();

export default class Menu extends React.Component{
	constructor(props){
		super(props);
		this.__sltSortByChange = this.__sltSortByChange.bind(this);
		this.__sltFilterChange = this.__sltFilterChange.bind(this);
	}
	__sltSortByChange(e){
		window.emitter.emit('changeSortBy', e.target.value);
	}
	__sltFilterChange(e){
		window.emitter.emit('changeFilter', e.target.value);
	}
	render(){
		//let HomeMenu = (window.HomeMenu) ? window.HomeMenu : null;

		return <nav className="navbar navbar-default navbar-fixed-top">
			<div className="container">
				<div className="navbar-header">
					<button type="button" className="navbar-toggle collapsed" data-toggle="collapse" data-target="#navbar" aria-expanded="false" aria-controls="navbar">
						<span className="sr-only">Toggle navigation</span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
						<span className="icon-bar"></span>
					</button>
					<a className="navbar-brand" href="#">TubeChatXYZ</a>
				</div>
				<div id="navbar" className="navbar-collapse collapse">
					<ul className="nav navbar-nav">
						<li className="active"><a href="/">Home</a></li>
					</ul>
					<form className="navbar-form navbar-right">
						<div className="form-group">
							<label htmlFor="sltFilter">Filter:&nbsp;</label>
							<select name="sltFilter" id="sltFilter" className="form-control" onChange={this.__sltFilterChange}>
								<option value="Features" defaultValue='Features'>Features</option>
								<option value="Female">Female</option>
								<option value="Male">Male</option>
								<option value="Coupe">Coupe</option>
							</select>
						</div>
						&nbsp;
						<div className="form-group">
							<label htmlFor="sltSortBy">Sort:&nbsp;</label>
							<select name="sltSortBy" id="sltSortBy" className="form-control" onChange={this.__sltSortByChange}>
								<option value="NumberUsersHighestFirst" defaultValue='NumberUsersHighestFirst'>Users : highest first</option>
								<option value="NumberUsersLowestFirst">Users : lowest first</option>
								<option value="AgeHighestFirst">Age : highest first</option>
								<option value="AgeLowestFirst">Age : lowest first</option>
							</select>
						</div>
					</form>
				</div>
			</div>
		</nav>
	}
}
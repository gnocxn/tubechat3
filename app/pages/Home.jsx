import React from 'react';
import oboe from 'oboe';
import _ from 'lodash';
import async from 'async';
import hat from 'hat';
import localForage from 'localforage';
//import db from '../db.js';

const bongaCashApiUrl = 'http://tools.bongacams.com/promo.php?c=301528&type=api&api_type=json';
const chaturbateApiUrl = 'http://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=eqdcq';

class Model {
	constructor(username, num_users, imageProfile, age, gender, displayName) {
		this.username = username;
		this.num_users = num_users;
		this.imageProfile = imageProfile;
		this.age = age || 18;
		this.gender = gender;
		this.displayName = (displayName) ? displayName : username;
	}
}

const imageWaiting = (window.imageWaiting) ? window.imageWaiting : 'https://49.media.tumblr.com/e7efc2afbed488b45c7df9c2dea0d6a3/tumblr_o5xgbsQjnw1vsnhfwo1_250.gif';

let Home = React.createClass({
	getInitialState(){
		return {
			_models: [],
			models: [],
			isLoaded: false,
			filter: {},
			sortBy: 'NumberUsersHighestFirst'
		}
	},
	__queryModels(ctx){
		let self = ctx || this;
		self.setState({isLoaded : false});
		localForage.getItem('models').then(function (models) {
			let filter = self.state.filter;
			let sortBy = self.state.sortBy;
			switch (sortBy) {
				case 'NumberUsersLowestFirst':
					models = _.chain(models).filter(filter).sortBy((m)=>{
						return m.num_users;
					}).value();
					break;
				case 'AgeHighestFirst':
					models = _.chain(models).filter(filter).sortBy((m)=>{
						return m.age;
					}).reverse().value();
					break;
				case 'AgeLowestFirst':
					models = _.chain(models).filter(filter).sortBy((m)=>{
						return m.age;
					}).value();
					break;
				default:
					models = _.chain(models).filter(filter).sortBy((m)=>{
						return m.num_users;
					}).reverse().value();
					break;
			}
			self.setState({isLoaded : true, models: models})
		});
	},
	componentWillMount() {
		let self = this;
		window.emitter.addListener('changeSortBy', function (sort) {
			self.setState({sortBy: sort},()=>{
				window.emitter.emit('queryData');
			});
		})

		window.emitter.addListener('changeFilter', function (filter) {
			let _filter = self.state.filter;
			switch (filter) {
				case 'Female':
					_filter = {gender: 'f'}
					break;
				case 'Male' :
					_filter = {gender: 'm'}
					break;
				case 'Couple' :
					_filter = {gender: 'c'}
					break;
				default:
					_filter = {}
					break;
			}
			self.setState({filter: _filter},()=>{
				window.emitter.emit('queryData');
			});
		});

		window.emitter.addListener('queryData', function () {
			self.__queryModels(self);
		})

		let hash = hat();
		localForage.clear();
		async.race([
			(cb)=> {
				oboe(chaturbateApiUrl)
					.node('{username num_users}', function (obj, path) {
						let itemIndex = path[path.length - 1];
						let model = new Model(obj.username, obj.num_users, obj.image_url_360x270, obj.age, obj.gender, obj.display_name);
						if (itemIndex < 10) {

							let models = self.state.models;
							models.push(model);
							self.setState({models: models});
						}
						return model;
					})
					.done(function (things) {
						localForage.getItem('models').then(function (models) {
							models = _.union(models || [], things);
							localForage.setItem('models', models).then(function () {
								window.emitter.emit('loadedData');
								cb(null, things.length);
							});
						});
					})
			},
			(cb)=> {
				oboe(bongaCashApiUrl)
					.node('{username members_count}', function (obj, path) {
						let itemIndex = path[path.length - 1];
						let _gender = 't';
						if (obj.gender === 'Female') _gender = 'f';
						if (obj.gender === 'Male') _gender = 'm';
						if (obj.gender.indexOf('Couple') > -1) _gender = 'c';
						let model = new Model(obj.username, obj.members_count, obj.profile_images.thumbnail_image_big_live, obj.display_age, _gender, obj.display_name);
						if (itemIndex < 10) {
							let models = self.state.models;
							models.push(model);
							self.setState({models: models});
						}
						return model;
						//return oboe.drop;
					})
					.done(function (things) {
						localForage.getItem('models').then(function (models) {
							models = _.union(models || [], things);
							localForage.setItem('models', models).then(function () {
								cb(null, things.length)
							});
						});
					})
			}
		], function (error, results) {
			console.log(results);
			//db('models').chain().remove((m)=>{ return m.hash !== hash}).value();
			self.setState({isLoaded: true});
			window.emitter.emit('queryData');
		})
	},

	componentDidMount() {

	},

	componentDidUpdate() {

	},

	render() {
		let models = _.chain(this.state.models).take(20).value();
		let loadingSection = (this.state.isLoaded === false) ? <div className="loading">Loading&#8230;</div> : ''
		return (
			<div>
				{loadingSection}
				<div className="row">
					{models.map((m)=> {
						return <ModelItem key={m.username} model={m}/>
					})}
				</div>
			</div>
		)
	}
})

let SpanE = React.createClass({
	render(){
		let className = this.props._className;
		let content = this.props.content;
		return <span className={className}>{content}</span>
	}
});

let ModelItem = React.createClass({
	render(){
		let model = this.props.model;
		return (
			<div className="col-lg-3 col-md-4 col-xs-6 thumb">
				<a href="#" className="thumbnail">
					<ImageProfile id={model.username} alt={model.displayName} src={model.imageProfile}/>
				</a>

				<p className="info">
					<span className="pull-left">Age : {model.age}</span>
					<span className="pull-right">{model.num_users}</span>
				</p>
			</div>
		)
	}
})

let ImageProfile = React.createClass({
	componentDidMount(){
		/*		let image = new Image();
		 let imageProduct = document.getElementById(`image_${this.props.id}`);
		 image.onload = function () {
		 imageProduct.src = this.src;
		 }
		 image.src = this.props.src;*/
	},
	render(){
		return <img src={imageWaiting} alt={this.props.alt} className="image-responsive center-block"
		            id={`image_${this.props.id}`}/>
	}
})

module.exports = Home;
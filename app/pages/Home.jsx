import React from 'react';
//import safePromise from 'react-safe-promise';
import {Link} from 'react-router';
import oboe from 'oboe';
import _ from 'lodash';
import async from 'async';
import localForage from 'localforage';
import hat from 'hat';

//import db from '../db.js';

const bongaCashApiUrl = 'http://tools.bongacams.com/promo.php?c=301528&type=api&api_type=json';
const chaturbateApiUrl = 'http://chaturbate.com/affiliates/api/onlinerooms/?format=json&wm=eqdcq';

class Model {
	constructor(username, num_users, imageProfile, age, gender, displayName, roomSubject, iframeUrl, source) {
		this.username = username;
		this.num_users = num_users;
		this.imageProfile = imageProfile;
		this.age = age || 18;
		this.gender = gender;
		this.displayName = (displayName) ? displayName : username;
		this.roomSubject = roomSubject || '';
		this.iframeUrl = iframeUrl;
		this.source = source;
	}
}

const imageWaiting = (window.imageWaiting) ? window.imageWaiting : 'https://49.media.tumblr.com/e7efc2afbed488b45c7df9c2dea0d6a3/tumblr_o5xgbsQjnw1vsnhfwo1_250.gif';
const defaultState = {
	models: [],
	_models: [],
	isLoaded: false,
	filter: {},
	limit: 20,
	sortBy: 'NumberUsersHighestFirst'
}

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.state = _.clone(defaultState);
		this.__queryModels = this.__queryModels.bind(this);
		this.__viewMoreClick = this.__viewMoreClick.bind(this);
	}

	__queryModels(ctx) {
		let self = ctx || this;
		self.setState({isLoaded: false});
		localForage.getItem('models').then(function (models) {
			let filter = self.state.filter;
			let sortBy = self.state.sortBy;
			switch (sortBy) {
				case 'NumberUsersLowestFirst':
					models = _.chain(models).filter(filter).sortBy((m)=> {
						return m.num_users;
					}).value();
					break;
				case 'AgeHighestFirst':
					models = _.chain(models).filter(filter).sortBy((m)=> {
						return m.age;
					}).reverse().value();
					break;
				case 'AgeLowestFirst':
					models = _.chain(models).filter(filter).sortBy((m)=> {
						return m.age;
					}).value();
					break;
				default:
					models = _.chain(models).filter(filter).sortBy((m)=> {
						return m.num_users;
					}).reverse().value();
					break;
			}
			//let _models = _.take(models, self.state.limit);
			self.setState({isLoaded: true, models: models})
		});
	}

	componentWillMount() {
		let self = this;
		window.emitter.addListener('changeSortBy', function (sort) {
			self.setState({sortBy: sort}, ()=> {
				//window.emitter.emit('queryData');
				self.__queryModels(self);
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
			self.setState({filter: _filter}, ()=> {
				self.__queryModels(self);
			});
		});


		localForage.clear();
		async.race([
			(cb)=> {
				oboe({url : chaturbateApiUrl,  withCredentials : false})
					.node('{username num_users}', function (obj, path) {
						let itemIndex = path[path.length - 1];
						let src = obj.iframe_embed_revshare.match(/src\=\'(.*)\' height/);
						src = (src) ? src[1] : obj.chat_room_url_revshare;
						let model = new Model(obj.username, obj.num_users, obj.image_url_360x270, obj.age, obj.gender, obj.display_name, obj.room_subject, src, 'CHATURBATE');
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
								//window.emitter.emit('queryData');
								self.__queryModels(self);
								cb(null, things.length);
							});
						});
					})
			},
			(cb)=> {
				oboe({url : bongaCashApiUrl,withCredentials : false})
					.node('{username members_count}', function (obj, path) {
						let itemIndex = path[path.length - 1];
						let _gender = 't';
						if (obj.gender === 'Female') _gender = 'f';
						if (obj.gender === 'Male') _gender = 'm';
						if (obj.gender.indexOf('Couple') > -1) _gender = 'c';
						let model = new Model(obj.username, obj.members_count, obj.profile_images.thumbnail_image_big_live, obj.display_age, _gender, obj.display_name, obj.turns_on, obj.embed_chat_url, 'BONGACASH');
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
			self.setState({isLoaded: true}, function () {
				self.__queryModels(self);
			});
			//window.emitter.emit('queryData');
		})
	}

	componentWillUnmount() {
		this.setState(_.clone(defaultState))
	}

	__viewMoreClick(e) {
		let limit = this.state.limit;
		limit += 20;
		this.setState({
			limit: limit
		}, function () {

		})
	}

	render() {
		let models = _.chain(this.state.models).take(this.state.limit).value();
		let loadingSection = (this.state.isLoaded === false) ? <div className="loading">Loading&#8230;</div> : ''
		return (
			<div>
				{loadingSection}
				<div className="row">
					{models.map((m)=> {
						return <ModelItem key={hat()} model={m}/>
					})}
				</div>
				<div className="row">
					<div className="col-md-12 col-lg-12 text-center">
						<button className="btn btn-primary" onClick={this.__viewMoreClick}>
							View more
						</button>
					</div>
				</div>
			</div>
		)
	}
}

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
		let tooltip = model.displayName + '\n' + model.roomSubject;
		return (
			<div className="col-lg-3 col-md-4 col-xs-6 thumb">
				<Link to={`/user/${model.username}`} className="thumbnail" data-toggle="tooltip" data-placement="right"
				      title={tooltip}>
					<ImageProfile id={model.username} alt={model.displayName} src={model.imageProfile}/>
				</Link>

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
		/*let image = new Image();
		 let imageProduct = document.getElementById(`image_${this.props.id}`)
		 ;
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

//export default safePromise(Home);
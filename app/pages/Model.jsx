import React from 'react';
import _ from 'lodash';
import localForage from 'localforage';

export default class Model extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			model: {},
			models: []
		}
	}

	componentWillMount() {
		let self = this;
		let {username} = self.props.params;
		localForage.getItem('models').then(function (models) {
			let model = _.find(models, (m)=> {
				return m.username === username
			});
			if (model) self.setState({model: model, models: models});
		})
	}

	render() {
		return <IFRAME model={this.state.model}/>
	}
}

let IFRAME = React.createClass({
	componentDidMount(){

	},
	__modelLoaded(){
		$('div.loading').hide();
	},
	render(){
		let model = this.props.model;
		let roomClassName = model.source === 'CHATURBATE' ? 'col-md-12' : 'col-md-12';
		return <div>
			<div className="loading">Loading&#8230;</div>
			<div className="row">
				<div className={roomClassName}>
					<div className="panel panel-default modelShow">
						<div className="panel-heading">
							<h3 className="panel-title">{model.username}</h3>
						</div>
						<div className="panel-body">
							<div className="embed-responsive embed-responsive-16by9">
								<iframe onLoad={this.__modelLoaded} className="embed-responsive-item" src={model.iframeUrl}
								        style={{border:'none'}}></iframe>
							</div>
						</div>

					</div>
				</div>
			</div>
		</div>
	}
})
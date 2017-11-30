import React, { Component } from 'react'
import lodash from 'lodash'
import unitsObj from '../units.json'
// eslint-disable-next-line
import firebase, { auth, provider } from '../firebase'
import PropTypes from 'prop-types'
import { withStyles } from 'material-ui/styles'
import { Link } from 'react-router-dom'
import AppBar from 'material-ui/AppBar'
import SwipeableViews from 'react-swipeable-views'
import Tabs, { Tab } from 'material-ui/Tabs'
import StarIcon from 'material-ui-icons/Star'
import About from './about'
import User from './user'
import './css/units.css'
import 'font-awesome/css/font-awesome.min.css'

function TabContainer({ children, dir }) {
    return (
        <div dir={dir} style={{ padding: 8 * 3 }}>
            {children}
        </div>
    );
}

TabContainer.propTypes = {
    children: PropTypes.node.isRequired,
    dir: PropTypes.string.isRequired,
};

const styles = theme => ({
    root: theme.mixins.gutters({
        paddingTop: 16,
        paddingBottom: 16,
        marginTop: theme.spacing.unit * 3,
    }),
    root: {
        backgroundColor: theme.palette.background.paper,
    },
})

class Units extends Component {
    constructor(props) {
        super(props)
        this.state = { 
            unitsListed: [],
            user: null,
            userUnitList: [],
        }
        this.addUnitToMyList = this.addUnitToMyList.bind(this)
    }

    handleChange = (event, value) => {
        this.setState({ value });
    };
    
    handleChangeIndex = index => {
        this.setState({ value: index });
    };

    state = {
        value: 0,
    };

    componentWillMount() {
        this.setState({
            unitsListed: lodash.values(unitsObj)
        })
    }

    componentDidMount() {
        auth.onAuthStateChanged((user) => {
            if (user) {
                this.setState({ user })
                firebase.database().ref('ffbexvius/users/'+user.uid+'/units/').on('value', (snapshot)  => {
                    let listUnitsUser = lodash.values(snapshot.val())
                    //this.setState({ userUnitList: listUnitsUser })
                    let tempUserList = listUnitsUser // firebase
                    let tempJsonList = this.state.unitsListed // units.json
                    /* captura os elementos do firebase em tempUserList compara com o tempJsonList e marca quais devem serem exibidos como ativos ou não usando a classe CSS unit-hide */
                    for (let j = 0; j < tempUserList.length; j++) {
                        for (let f = 0; f < tempJsonList.length; f++) {
                            if(tempUserList[j].unit_id === tempJsonList[f].unit_id){
                                tempJsonList[f].own = tempUserList[j].own
                            }
                        }
                    }
                    this.setState({ unitsListed: tempJsonList})
                })
            }
        })
    }

    addUnitToMyList(e, unit_id) {
        e.preventDefault()
        console.log(unit_id)
        let clickedUnit = document.getElementById(unit_id)
        console.log(clickedUnit.dataset.own)
        if (clickedUnit.dataset.own === 'false') {
            console.log('entrei aqui')
            firebase.database().ref('ffbexvius/users/'+this.state.user.uid+'/units/'+unit_id).set({
                own: true,
                unit_id: unit_id
            })
            document.getElementById(unit_id).classList.remove("unit-hide")
        } else {
            firebase.database().ref('ffbexvius/users/'+this.state.user.uid+'/units/'+unit_id).set({
                own: false,
                unit_id: unit_id
            })
            document.getElementById(unit_id).className = "unit-hide"
        }
    }

    renderUnitsList(unitsListed, star) {
        const filteredUnits = unitsListed.filter(unit => unit.rarity_min === star)
        return filteredUnits.map(unit => (
            <div key={unit.unit_id} className='unit'>
                <a href='' onClick={(evt) => this.addUnitToMyList(evt, unit.unit_id)}>
                    <img id={unit.unit_id} src={unit.img} alt={unit.name} className={unit.own ? 'unit-img' : 'unit-img unit-hide'} data-own={unit.own === true ? true : false} />
                </a>
                <div>{unit.name}</div>
            </div>
        )   )
    }

    render() {
        const { classes, theme } = this.props
        return (
            <div className='main'>
                <aside className='sidebar'>
                    {this.state.user ? 
                    <User userInfo={this.state.user} /> : '' }
                    <About />
                </aside>
                <div className='list'>
                    <AppBar position="static" color="default">
                        <Tabs value={this.state.value} onChange={this.handleChange} indicatorColor="primary" textColor="primary" fullWidth>
                            <Tab icon={<div><StarIcon /><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>} />
                            <Tab icon={<div><StarIcon /><StarIcon /><StarIcon /><StarIcon /></div>} />
                            <Tab icon={<div><StarIcon /><StarIcon /><StarIcon /></div>} />
                            <Tab icon={<div><StarIcon /><StarIcon /></div>} />
                            <Tab icon={<StarIcon />} />
                        </Tabs>
                    </AppBar>
                    <SwipeableViews axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'} index={this.state.value} onChangeIndex={this.handleChangeIndex}>
                        <TabContainer dir={theme.direction}>
                            <div className='unitList'>
                                {this.renderUnitsList(this.state.unitsListed, 5)}
                            </div>
                        </TabContainer>
                        <TabContainer dir={theme.direction}>
                            <div className='unitList'>
                                {this.renderUnitsList(this.state.unitsListed, 4)}
                            </div>
                        </TabContainer>
                        <TabContainer dir={theme.direction}>
                            <div className='unitList'>
                                {this.renderUnitsList(this.state.unitsListed, 3)}
                            </div>
                        </TabContainer>
                        <TabContainer dir={theme.direction}>
                            <div className='unitList'>
                                {this.renderUnitsList(this.state.unitsListed, 2)}
                            </div>
                        </TabContainer>
                        <TabContainer dir={theme.direction}>
                            <div className='unitList'>
                                {this.renderUnitsList(this.state.unitsListed, 1)}
                            </div>
                        </TabContainer>
                    </SwipeableViews>
                </div>
            </div>
        )
    }
}

Units.propTypes = {
    classes: PropTypes.object.isRequired,
    theme: PropTypes.object.isRequired,
}

export default withStyles(styles, { withTheme: true })(Units)
// @flow

import React from 'react';
import PropTypes from 'prop-types';
import Helmet from 'react-helmet';
import withStyles from '@material-ui/core/styles/withStyles';
import Grid from '@material-ui/core/Grid';
import {withIface} from 'metadata-redux';
import {item_props} from '../App/menu';
import Builder from '../Builder';
import Props from '../Props/Main';
import {decrypt} from '../Barcode/connect';

function styles(theme) {
  return {
    workplace: {
      minHeight: 'calc(100vh - 50px)', // Makes the hero full height until we get some more content.
    },
    props: {
      paddingTop: theme.spacing.unit * 2,
    }
  };
}

class Imposts extends React.Component {

  constructor(props, context) {
    super(props, context);
    this.editor = null;
    this.onBarcode = this.onBarcode.bind(this);
    this.shouldComponentUpdate(props);
    this.state = {
      ox: {},
      cnstr: 1,
    };
  }

  shouldComponentUpdate({handleIfaceState, title}) {
    const iprops = item_props();
    if(iprops.text && title != iprops.text) {
      handleIfaceState({
        component: '',
        name: 'title',
        value: iprops.text,
      });
      return false;
    }
    return true;
  }

  componentDidMount() {
    $p.md.on('barcode', this.onBarcode);
  }

  componentWillUnmount() {
    $p.md.off('barcode', this.onBarcode);
  }

  onBarcode(barcode) {
    if(this.editor) {
      const {project} = this.editor;
      decrypt(barcode)
        .then((bar) => {
          const {cnstr, ox} = bar;
          project.load(ox, {auto_lines: false, custom_lines: false, mosquito: false})
            .then(() => {
              const contour = project.getItem({cnstr});
              if(contour) {
                project.draw_fragment({elm: -cnstr});
                contour.glasses(true);
                contour.l_dimensions.draw_by_imposts();
                project.zoom_fit();
                this.setState(bar);
              }
            });
        })
        .catch(({message}) => {
          const {ox} = this.state;
          if(ox && ox.unload) {
            ox.unload();
          }
          project.clear();
          this.setState({ox: {}});
        });
    }
  }

  render() {
    const {classes} = this.props;
    const iprops = item_props();
    return <Grid container>
      <Helmet title={iprops.text}>
        <meta name="description" content={iprops.title} />
      </Helmet>
      <Grid item sm={12} lg={8} className={classes.workplace}>
        <Builder
          registerChild={(el) => {
            this.editor = el;
          }}
        />
      </Grid>
      <Grid item sm={12} lg={4} className={classes.props}>
        <Props {...this.state}/>
      </Grid>
  </Grid>;
  }
}

Imposts.propTypes = {
  handleIfaceState: PropTypes.func.isRequired,
  title: PropTypes.string,
  classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(withIface(Imposts));

import React from 'react';
import PropTypes from 'prop-types';
import Loader from '../../common/Loader';

export default class InfiniteLoader extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      items: null,
      page: 0,
      loading: false,
      end: false,
    };

    this.loadMore = this.loadMore.bind(this);
    this.onScroll = this.onScroll.bind(this);
    this.onElementScroll = this.onElementScroll.bind(this);
  }

  componentDidMount() {
    this.loadMore();

    const { scrollElement } = this.props;

    if (scrollElement && scrollElement.current) {
      this.scrollElement = scrollElement.current;

      this.scrollElement.addEventListener('scroll', this.onElementScroll);
    }
  }

  componentWillUnmount() {
    if (this.scrollElement) {
      this.scrollElement.removeEventListener('scroll', this.onElementScroll);
    }
  }

  onElementScroll({ target: { scrollTop, scrollHeight, clientHeight } }) {
    this.onScroll({ scrollTop, scrollHeight, clientHeight });
  }

  onScroll({ scrollTop, scrollHeight, clientHeight }) {
    if (scrollTop >= scrollHeight - clientHeight * 3) {
      this.loadMore();
    }
  }

  async loadMore() {
    const { end, loading, page, items } = this.state;

    if (end || loading) {
      return;
    }

    this.setState({
      loading: true,
    });

    try {
      const limit = 50;

      const newItems = await this.props.load({
        limit,
        offset: page * limit,
      });

      this.setItems({
        page: page + 1,
        items: [...(items || []), ...newItems],
        end: newItems.length < limit,
      });
    } finally {
      this.setState({
        loading: false,
      });
    }
  }

  setItems(state) {
    this.props.onSetItems(state);

    this.setState(state);
  }

  render() {
    const { loading, items } = this.state;

    if (!items) {
      return <Loader />;
    }

    return (
      <>
        {this.props.render({ onScroll: this.onScroll }, this.state)}
        {loading && <Loader />}
      </>
    );
  }
}

InfiniteLoader.propTypes = {
  load: PropTypes.func.isRequired,
  render: PropTypes.func.isRequired,
  onSetItems: PropTypes.func,
  scrollElement: PropTypes.shape({ current: PropTypes.instanceOf(Element) }),
};

InfiniteLoader.defaultProps = {
  onSetItems: state => null,
  scrollElement: null,
};
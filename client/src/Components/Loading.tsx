import React from "react";
import CancellablePromise from "../CancellablePromise";

interface Props<T> {
  load: (cancel: CancellablePromise<T>) => Promise<T>,
  render: () => React.ReactNode
}

export default class Loading<T> extends React.Component<Props<T>> {
  state = {
    loading: true,
    load: null as CancellablePromise<T> | null,
    error: null as Error | null
  }

  public componentDidMount() {
    const load = new CancellablePromise<T>(this.props.load);
    load.wait()
      .catch(error => {
        if (!load.isCancelled) {
          this.setState({error});
        }
      })
      .finally(() => {
        if (!load.isCancelled) {
          this.setState({loading: false});
        }
      });
    this.setState({load});
  }

  public componentWillUnmount() {
    if (this.state.load) {
      this.state.load.cancel();
    }
  }

  public render() {
    if (this.state.error) {
      return (<div>
        <h2>
          Failed to load
        </h2>
        <p>
          {this.state.error.message}
        </p>
      </div>)
    }
    if (this.state.loading) {
      return (<div>Loading...</div>)
    }
    return this.props.render();
  }
}
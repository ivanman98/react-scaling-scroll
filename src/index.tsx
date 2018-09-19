import * as React from 'react';
import * as _ from 'lodash';
import styles from './styles.css';

export type Props = { text: string }

export interface IAppProps {
    elements?: React.ReactNode[],
    startOfScrollInVH?: number
}

export interface IDivState {
    isCur: boolean,
    height?: number,
    marginLeft: number,
    marginTop: number
    scale: number,
    width?: number
}

export interface IAppState {
    indexOfCurDiv: number,
    VHInPX: number,
    VWInPX: number,
    divsState: IDivState[],
    scrollYPosition: number
}

export default class App extends React.Component<IAppProps, IAppState> {
    public state = {
        VHInPX: 0,
        VWInPX: 0,
        divsState: [],
        indexOfCurDiv: 0,
        scrollYPosition: 0
    };

    public componentWillReceiveProps(nextProps: IAppProps): void {
        const { elements } = this.props;
        const { elements: nextElements } = nextProps;

        if(_.get(elements, 'length', 0) !== _.get(nextElements, 'length', 0)) {
            this.setStateFromProps(nextProps);
        }
    }

    public componentDidMount(): void {
        window.addEventListener('scroll', this.onScroll);
        window.addEventListener('resize', this.onResize);

        this.onScroll();
        this.onResize();
        this.setStateFromProps(this.props);
    }

    public componentWillUnmount() {
        window.removeEventListener('scroll', this.onScroll);
        window.removeEventListener('resize', this.onResize);
    }

    public render(): React.ReactNode {
        const { elements } = this.props;
        const { divsState } = this.state;

        return (
            <div className={styles.app}>
                <p style={{ position: 'fixed', top: 0, opacity: 0 }} />
                {_.map(divsState, ({ marginTop, height, width, marginLeft }: IDivState, index: number) => (
                    <div className={styles.div} style={{
                        height,
                        marginLeft,
                        marginTop,
                        width,
                    }} key={index}>
                        {_.get(elements, `[${index}]`, null)}
                    </div>
                ))}
            </div>
        );
    }

    private setStateFromProps(props: IAppProps): void {
        const { elements } = props;

        this.setState({
            divsState: _.map(elements, () => ({
                isCur: false,
                marginLeft: 0,
                marginTop: 0,
                scale: 0
            }))
        });
    }

    private getMaxScrollOnConveyor = ({ heightOfConveyorInVH }: {
        heightOfConveyorInVH: number
    }) => {
        const { VHInPX } = this.state;

        return heightOfConveyorInVH * VHInPX / 100 * 70;
    };

    private getMarginTop = ({ index, heightOfConveyorInVH, scrollYPosition, prevBlocks }: {
        index: number,
        heightOfConveyorInVH: number,
        scrollYPosition: number,
        prevBlocks: IDivState[]
    }) => {
        const { startOfScrollInVH } = this.props;
        const { VHInPX } = this.state;
        const maxScrollOnConveyor: number = this.getMaxScrollOnConveyor({ heightOfConveyorInVH });
        let endOfPrevBlock: number = VHInPX * (startOfScrollInVH || 0);

        for(let i = 0; i < index; i++) {
            endOfPrevBlock += prevBlocks[i].marginTop + _.get(prevBlocks, `[${i}].height`, 0)
        }

        if(scrollYPosition < endOfPrevBlock) {
            return 0;
        } else if(scrollYPosition < endOfPrevBlock + maxScrollOnConveyor) {
            return scrollYPosition - endOfPrevBlock;
        } else {
            return maxScrollOnConveyor;
        }
    };

    private getScale = ({ index, heightOfConveyorInVH, scrollYPosition, prevBlocks }: {
        index: number,
        heightOfConveyorInVH: number,
        scrollYPosition: number,
        prevBlocks: IDivState[]
    }) => {
        const { startOfScrollInVH } = this.props;
        const { VHInPX } = this.state;
        const maxScrollOnConveyor: number = this.getMaxScrollOnConveyor({ heightOfConveyorInVH });
        let endOfPrevBlock: number = VHInPX * (startOfScrollInVH || 0);

        for(let i = 0; i < index; i++) {
            endOfPrevBlock += prevBlocks[i].marginTop + _.get(prevBlocks, `[${i}].height`, 0)
        }

        if(scrollYPosition < endOfPrevBlock) {
            return 1;
        } else if(scrollYPosition < endOfPrevBlock + maxScrollOnConveyor) {
            return 1 - (((scrollYPosition - endOfPrevBlock) / maxScrollOnConveyor / 100) * 25);
        } else {
            return 0.75;
        }
    };

    private onScroll = () => {
        const { divsState, VHInPX, VWInPX } = this.state;
        const scrollYPosition: number = window.scrollY;
        const heightOfConveyorInVH: number = 100;
        const widthOfConveyorInVW: number = 100;
        const maxHeightOfDiv: number = heightOfConveyorInVH * VHInPX;
        const maxWidthOfDiv: number = widthOfConveyorInVW * VWInPX;
        const indexOfCurDiv: number =
            Math.floor(((scrollYPosition / VHInPX) - 300) / (heightOfConveyorInVH * 1.5) + 0.2);

        // calculate state
        for(let i = 0; i < divsState.length; i++) {
            const scale: number = this.getScale({
                heightOfConveyorInVH,
                index: i,
                prevBlocks: divsState,
                scrollYPosition
            });
            const marginTop: number = this.getMarginTop({
                heightOfConveyorInVH,
                index: i,
                prevBlocks: divsState,
                scrollYPosition
            });
            const isCur: boolean = indexOfCurDiv === i;

            const divState: IDivState = {
                height: maxHeightOfDiv * scale,
                isCur,
                marginLeft: (maxWidthOfDiv - (maxWidthOfDiv * scale)) / 2,
                marginTop,
                scale,
                width: maxWidthOfDiv * scale
            };

            _.set(divsState, `[${i}]`, divState);
        }

        this.setState({
            divsState,
            indexOfCurDiv,
            scrollYPosition
        });
    };

    private onResize = () => {
        this.setState({
            VHInPX: document.documentElement.clientHeight / 100,
            VWInPX: document.documentElement.clientWidth / 100
        }, () => {
            this.onScroll();
        });
    };
}

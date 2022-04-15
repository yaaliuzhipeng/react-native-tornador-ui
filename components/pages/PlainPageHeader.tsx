import React from 'react';
import BaseContainer from './BaseContainer';
import HeaderPlainBackdrop, { HeaderPlainBackdropProps } from './HeaderPlainBackdrop';
import HeaderPlainContent, { HeaderPlainContentProps } from './HeaderPlainContent';

export const PlainPageHeaderHeight = 48;
const PlainPageHeader = (props: {
    height?: number;
    zIndex?: number;
    backdropConfigs?: HeaderPlainBackdropProps;
    contentConfigs?: HeaderPlainContentProps;
}) => {
    const { zIndex = 999, height = PlainPageHeaderHeight, backdropConfigs = {}, contentConfigs = {} } = props;
    return (
        <BaseContainer
            position='top'
            zIndex={zIndex}
            height={height}
            renderBackdropComponent={(props) => <HeaderPlainBackdrop
                {...props}
                {...backdropConfigs}
            />}
            renderContentComponent={(props) => <HeaderPlainContent
                {...props}
                {...contentConfigs}
            />}
        />
    )
}
export default PlainPageHeader;
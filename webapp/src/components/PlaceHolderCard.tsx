import { Card, CardContent, Typography } from '@mui/material';
import GlobalSpinner from '../components/GlobalSpinner.tsx';
import { ReactNode } from 'react';

interface PlaceHolderCardProps {
    title?: string;
    children?: ReactNode;
    loading?: boolean;
}
const PlaceholderCard = ({
    title,
    children,
    loading
}: PlaceHolderCardProps) => {
    return (
        <Card>
            <CardContent>
                {loading ? (
                    <GlobalSpinner />
                ) : (
                    <>
                        {!!title && (<Typography variant="h6">{title}</Typography>)}
                        {!!children && (<>{children}</>)}
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PlaceholderCard;
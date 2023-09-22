import { Card, CardContent, Typography } from '@mui/material';
import GlobalSpinner from '../components/GlobalSpinner.tsx';

interface PlaceHolderCardProps {
    title: string;
    value: string;
    loading: boolean;
}
const PlaceholderCard = ({
    title,
    value,
    loading
}: PlaceHolderCardProps) => {
    return (
        <Card>
            <CardContent>
                {loading? (
                    <GlobalSpinner />
                ) : (
                    <>
                        <Typography variant="h6">{title}</Typography>
                        <Typography variant="h4">{value}</Typography>
                    </>
                )}
            </CardContent>
        </Card>
    );
};

export default PlaceholderCard;
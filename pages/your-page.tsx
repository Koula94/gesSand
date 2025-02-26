import { GetServerSideProps } from 'next';

export const getServerSideProps: GetServerSideProps = async (context) => {
  // Fetch data here
  return {
    props: {
      // Pass data to the page
    },
  };
};

// Your page component
const YourPage = ({ data }) => {
  return (
    <div>
      {/* Render your data */}
    </div>
  );
};

export default YourPage; 
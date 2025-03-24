import { useQuery, gql } from '@apollo/client';
import { useEffect, useState } from 'react';

const GET_CONTENT = gql`
  query{
     posts {
       content {
          document
      }
     }
   }
`;

const Content = () => {
  const { loading, error, data } = useQuery(GET_CONTENT);
  const [content, setContent] = useState([])

  useEffect(() => {
    console.log(data); // Inspect the data structure
    if (data?.posts) {
      setContent(data.posts);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className='text-start p-5 text-lg'>
      {content.map((post) => (
        post.content.document.map((content,index)=>(
            <>
            <p key={index}>{content.children[0].text}</p>
             <br/>
             </>
        ))
      ))}
    </div>
  );
};

export default Content;

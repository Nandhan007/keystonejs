import { useQuery, gql } from '@apollo/client';
import { useEffect, useState } from 'react';

const GET_POSTS = gql`
  query{
  posts {
    title
    author {
      name
    }  
  }
}
`;

const Posts = () => {
  const { loading, error, data } = useQuery(GET_POSTS);
  const [post, setPost] = useState([])

  useEffect(() => {
    console.log(data); // Inspect the data structure
    if (data?.posts) {
      setPost(data.posts);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <ul>
      {post.map((post) => (
        <li key={post.title}>
          {post.title} ({post.author.name})
        </li>
      ))}
    </ul>
  );
};

export default Posts;

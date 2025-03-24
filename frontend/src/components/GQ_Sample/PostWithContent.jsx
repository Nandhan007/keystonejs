import { useQuery, gql } from "@apollo/client";
import { useEffect, useState } from "react";

const GET_POSTS_WITH_CONTENT = gql`
  query {
    posts {
      title
      author {
        name
      }
      content {
        document
      }
    }
  }
`;

const PostsWithContent = () => {
  const { loading, error, data } = useQuery(GET_POSTS_WITH_CONTENT);
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    console.log(data); // Inspect the data structure
    if (data?.posts) {
      setPosts(data.posts);
    }
  }, [data]);

  if (loading) return <p>Loading...</p>;
  if (error) return <p>Error: {error.message}</p>;

  return (
    <div className="text-start p-5 text-lg">
      {posts.map((post, index) => (
        <div key={index} className="mb-8">
          {/* Display title and author */}
          <h2 className="font-bold text-xl">{post.title}</h2>
          <p className="text-gray-600">by {post.author.name}</p>
          <br />

          {/* Display content */}
          {post.content.document.map((content, contentIndex) => (
            <p key={contentIndex} className="mb-4">
              {content.children[0].text}
            </p>
          ))}
        </div>
      ))}
    </div>
  );
};

export default PostsWithContent;

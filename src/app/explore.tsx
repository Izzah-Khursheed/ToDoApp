import { Redirect } from 'expo-router';

// Keep old bookmarks working without exposing the starter tutorial.
export default function ExploreScreen() {
  return <Redirect href="/" />;
}

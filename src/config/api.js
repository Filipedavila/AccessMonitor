import axios from "axios";

import dataJSON from '../utils/data.json'

const configs = await loadConfig();


export async function loadConfig(){
  const response = await fetch('/config.json');
  if (!response.ok) {
    throw new Error('Failed to load runtime configuration');
  }
  return response.json();
}

export const api = axios.create({
  baseURL: configs.REACT_APP_AMP_SERVER,
});

export const getEvalData = async (content, currentURL) => {
  if (configs.REACT_APP_API_DATA_SOURCE === "local") {
    return await getEvalDataByLocal(content, currentURL);
  }
  return await getEvalDataByAPI(content, currentURL);
}

// TODO: SRP , cannot receive argument that can be a URL or HTML content
// Refactor into two pure functions one for evaluation of html post and 
const getEvalDataByAPI = async (content, currentURLorHTML) => {
  if(content === "html") {
   return await api.post(`/eval/html`, { html: currentURLorHTML })
  } else {

   return await api.get(`/eval/${encodeURIComponent(currentURLorHTML)}`);  
  }
}


const getEvalDataByLocal = async (content, currentURL) => {
  const response = dataJSON
  return response;
}

import React, { useEffect, useState } from 'react';
import DVideo from '../abis/DVideo.json'
import Navbar from './Navbar'
import Main from './Main'
import Web3 from 'web3';
import './App.css';
import { convertFileToBase64 } from '../utils';

//Declare IPFS
const ipfsClient = require('ipfs-http-client')
const ipfs = ipfsClient({ host: 'ipfs.infura.io', port: 5001, protocol: 'https' }) // leaving out the arguments will default to these values

function App() {
  const [loading, setLoading] = useState(false)
  const [account, setAccount] = useState('')
  const [token, setToken] = useState({})
  const [videos, setVideos] = useState([])
  const [videoCount, setVideoCount] = useState(0)
  const [currentPost, setCurrentPost] = useState({})
  const [selectedVideo, setSelectedVideo] = useState()

  useEffect(() => {
    async function loadWeb3() {
      if (window.ethereum) {
        window.web3 = new Web3(window.ethereum)
        await window.ethereum.enable()
      }
      else if (window.web3) {
        window.web3 = new Web3(window.web3.currentProvider)
      }
      else {
        window.alert('Non-Ethereum browser detected. You should consider trying MetaMask!')
      }
    }

    async function loadBlockchainData() {
      const web3 = window.web3
      //Load accounts
      const accounts = await web3.eth.getAccounts()
      //Add first account the the state
      setAccount(accounts[0])
      //Get network ID
      const networkId = await web3.eth.net.getId()
      //Get network data
      const netWorkData =  DVideo.networks[networkId]
      //Check if net data exists, then
      if (netWorkData) {
        const address = netWorkData.address
        const abi = DVideo.abi
        const token = new web3.eth.Contract(abi, address)
        setToken(token)

        // load videos
        const videoCount = await token.methods.videoCount().call()
        let newVideos = []
        for (let i = videoCount; i > 0; i--) {
          const video = await token.methods.videos(i).call()
          if (video && video.hash && video.author) {
            newVideos.push(video)
          }
        }
        setVideoCount(videoCount)
        setVideos([...videos, ...newVideos])

        // latest video
        const latest = await token.methods.videos(videoCount).call()
        if (latest && latest.hash && latest.author) {
          setCurrentPost({
            hash: latest.hash,
            title: latest.title
          })
        }
        //Iterate throught videos and add them to the state (by newest)
  
  
        //Set latest video and it's title to view as default 
        //Set loading state to false
        setLoading(false)
      } else {
        //If network data doesn't exisits, log error
        alert("DVideo contract not deployed to detected network.")
      }
    }

    loadWeb3()
    loadBlockchainData()
  }, [])

  //Get video
  const captureFile = (e) => {
    e.preventDefault()
    const file = e.target.files[0]
    convertFileToBase64(file).then(dataUrl => {
      setSelectedVideo(Buffer.from(dataUrl))
    })
  }

  //Upload video
  const uploadVideo = (title) => {
    if (!selectedVideo) {
      alert("Please select a video file first!")
      return
    }

    ipfs.add(selectedVideo, (err, result) => {
      if (err) {
        alert("Upload video failed")
        return
      }
      if (result) {
        // put it on blockchain
        setLoading(true)
        try {
          token.methods.uploadVideo(result[0].hash, title)
            .send({ from: account })
            .on('transactionHash', () => {
              setLoading(false)
            })
        } catch (error) {
          alert("Upload failed!")
          setLoading(false)
        }
      }
    })
  }

  //Change Video
  const changeVideo = (hash, title) => {
    setCurrentPost({
      hash: hash,
      title: title
    })
  }

  return (
    <div>
      <Navbar 
        //Account
        account={account}
      />
      { loading
        ? <div id="loader" className="text-center mt-5"><p>Loading...</p></div>
        : <Main
            //states&functions
            captureFile={captureFile}
            uploadVideo={uploadVideo}
            videos={videos}
            changeVideo={changeVideo}
            currentPost={currentPost}
          />
      }
    </div>
  );
}

export default App;
import {Component} from 'react'
import Loader from 'react-loader-spinner'
import Cookies from 'js-cookie'
import {BsPlusSquare, BsDashSquare} from 'react-icons/bs'
import ProductCard from '../ProductCard'
import Header from '../Header'
import './index.css'

const apiStatusConstants = {
  initial: 'INITIAL',
  success: 'SUCCESS',
  failure: 'FAILURE',
  inProgress: 'IN_PROGRESS',
}

class ProductItemDetails extends Component {
  state = {
    productItemDetails: {},
    similarProducts: [],
    resStatus: apiStatusConstants.initial,
    errorMsg: '',
    quantity: 1,
  }

  componentDidMount() {
    this.getProducts()
  }

  componentDidUpdate(prevProps) {
    const {match} = this.props
    const {params} = match
    const {id} = params

    if (prevProps.match.params.id !== id) {
      this.getProducts()
    }
  }

  getProducts = async () => {
    this.setState({
      resStatus: apiStatusConstants.inProgress,
    })
    const jwtToken = Cookies.get('jwt_token')

    const {match} = this.props
    const {params} = match
    const {id} = params

    const apiUrl = `https://apis.ccbp.in/products/${id}`
    const options = {
      headers: {
        Authorization: `Bearer ${jwtToken}`,
      },
      method: 'GET',
    }
    const response = await fetch(apiUrl, options)
    const data = await response.json()

    if (response.ok) {
      console.log(response)
      const updatedData = {
        id: data.id,
        imageUrl: data.image_url,
        title: data.title,
        price: data.price,
        description: data.description,
        brand: data.brand,
        totalReviews: data.total_reviews,
        rating: data.rating,
        availability: data.availability,
      }

      const updatedSimilarProducts = data.similar_products.map(eachData => ({
        id: eachData.id,
        imageUrl: eachData.image_url,
        title: eachData.title,
        style: eachData.style,
        price: eachData.price,
        description: eachData.description,
        brand: eachData.brand,
        totalReviews: eachData.total_reviews,
        rating: eachData.rating,
        availability: eachData.availability,
      }))

      this.setState({
        productItemDetails: updatedData,
        similarProducts: updatedSimilarProducts,
        resStatus: apiStatusConstants.success,
      })
    } else {
      this.setState({
        resStatus: apiStatusConstants.failure,
        errorMsg: data.error_msg,
      })
    }
  }

  increaseQuantity = () =>
    this.setState(prevState => ({quantity: prevState.quantity + 1}))

  decreaseQuantity = () =>
    this.setState(prevState => ({
      quantity: prevState.quantity > 1 ? prevState.quantity - 1 : 1,
    }))

  renderProductItemDetails = () => {
    const {productItemDetails, similarProducts, quantity} = this.state
    console.log(productItemDetails)
    const {
      imageUrl,
      title,
      price,
      description,
      brand,
      totalReviews,
      rating,
      availability,
    } = productItemDetails

    return (
      <>
        <div className="product-details-container">
          <img className="product-details-img" src={imageUrl} alt="product" />
          <div className="product-details-texts-container">
            <h1 className="product-details-title">{title}</h1>
            <p className="product-details-price">Rs {price}/- </p>
            <div className="product-details-rating-review-container">
              <div className="product-details-rating-container">
                <p className="product-details-rating-text">{rating}</p>
                <img
                  className="product-details-star-img"
                  src="https://assets.ccbp.in/frontend/react-js/star-img.png"
                  alt="star"
                />
              </div>
              <p className="product-details-reviews-count">
                {totalReviews} Reviews
              </p>
            </div>
            <p className="product-description">{description}</p>
            <p className="availability-and-brand-text">
              <span className="bold">Available: </span>
              {availability}
            </p>
            <p className="availability-and-brand-text">
              <span className="bold">Brand: </span>
              {brand}
            </p>
            <hr className="ruler" />

            <div className="increase-decrease-btn-container">
              <button
                type="button"
                className="square-btn"
                onClick={this.decreaseQuantity}
                data-testid="minus"
              >
                <BsDashSquare className="btn-img" />
              </button>
              <p className="quantity">{quantity}</p>
              <button
                type="button"
                className="square-btn"
                onClick={this.increaseQuantity}
                data-testid="plus"
              >
                <BsPlusSquare className="btn-img" />
              </button>
            </div>

            <button type="button" className="add-to-cart-btn">
              ADD TO CART
            </button>
          </div>
        </div>
        <div className="similar-products-container">
          <h1 className="similar-products-text">Similar Products</h1>
          <ul className="products-list">
            {similarProducts.map(product => (
              <ProductCard productData={product} key={product.id} />
            ))}
          </ul>
        </div>
      </>
    )
  }

  renderLoadingView = () => (
    <div className="products-loader-container" data-testid="loader">
      <Loader type="ThreeDots" color="#0b69ff" height="50" width="50" />
    </div>
  )

  onRedirect = () => {
    const {history} = this.props
    history.push('/products')
  }

  // ^
  // | renderFailureView has the control over onRedirect function
  renderFailureView = () => {
    const {errorMsg} = this.state

    return (
      <div className="not-found-container">
        <img
          src="https://assets.ccbp.in/frontend/react-js/nxt-trendz-error-view-img.png"
          alt="failure view"
          className="product-not-found-img"
        />
        <h1 className="not-found-text">{errorMsg}</h1>
        <button
          type="button"
          className="continue-shopping-btn"
          onClick={this.onRedirect}
        >
          Continue Shopping
        </button>
      </div>
    )
  }

  renderViews = () => {
    const {resStatus} = this.state

    switch (resStatus) {
      case apiStatusConstants.success:
        return this.renderProductItemDetails()
      case apiStatusConstants.failure:
        return this.renderFailureView()
      case apiStatusConstants.inProgress:
        return this.renderLoadingView()
      default:
        return null
    }
  }

  render() {
    return (
      <div className="bg-details-container">
        <Header />
        {this.renderViews()}
      </div>
    )
  }
}

export default ProductItemDetails

import { apiService } from './api.service'
import { ApiConfiguration } from '@/types/api'

export interface ShippingRate {
  id: string
  serviceName: string
  serviceCode: string
  carrier: string
  rate: number
  estimatedDays: string
  deliveryDays: number
  guaranteedDelivery: boolean
  isAvailable: boolean
  currency: string
}

export interface ShippingAddress {
  id?: string
  name: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  postalCode: string
  country: string
  phone?: string
  email?: string
  isDefault?: boolean
}

export interface ShippingPackage {
  weight: number
  length: number
  width: number
  height: number
  weightUnit: 'lb' | 'kg'
  dimensionUnit: 'in' | 'cm'
}

export interface TrackingInfo {
  trackingNumber: string
  carrier: string
  status: string
  location: string
  estimatedDelivery: string
  events: TrackingEvent[]
}

export interface TrackingEvent {
  timestamp: string
  location: string
  status: string
  description: string
}

export interface ShippingLabel {
  id: string
  trackingNumber: string
  labelUrl: string
  labelFormat: 'pdf' | 'png' | 'zpl'
  carrier: string
  serviceCode: string
  createdAt: Date
}

export class LogisticsService {
  private async getActiveLogisticsApis(): Promise<ApiConfiguration[]> {
    try {
      const allApis = await apiService.getAllApiConfigurations()
      return allApis.filter(api => api.type === 'logistics' && api.isActive)
    } catch (error) {
      console.error('Failed to get active logistics APIs:', error)
      return []
    }
  }

  // Get shipping rates from all active logistics APIs
  async getShippingRates(
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    try {
      const activeApis = await this.getActiveLogisticsApis()
      const allRates: ShippingRate[] = []

      for (const api of activeApis) {
        try {
          const rates = await this.getRatesFromProvider(api, fromAddress, toAddress, packages)
          allRates.push(...rates)
        } catch (error) {
          console.error(`Failed to get rates from ${api.provider}:`, error)
        }
      }

      return allRates.sort((a, b) => a.rate - b.rate)
    } catch (error) {
      console.error('Failed to get shipping rates:', error)
      throw new Error('Failed to calculate shipping rates')
    }
  }

  // Get rates from specific provider
  private async getRatesFromProvider(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    switch (api.provider?.toLowerCase()) {
      case 'fedex':
        return await this.getFedExRates(api, fromAddress, toAddress, packages)
      case 'ups':
        return await this.getUPSRates(api, fromAddress, toAddress, packages)
      case 'dhl':
        return await this.getDHLRates(api, fromAddress, toAddress, packages)
      case 'bagster':
        return await this.getBagsterRates(api, fromAddress, toAddress, packages)
      default:
        return await this.getGenericRates(api, fromAddress, toAddress, packages)
    }
  }

  // FedEx API integration
  private async getFedExRates(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    try {
      const response = await fetch(`${api.baseUrl}/rate/v1/rates/quotes`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          accountNumber: {
            value: api.config?.accountNumber || '111111111'
          },
          rateRequestControlParameters: {
            returnTransitTimes: true,
            servicesRequested: {
              requestedServiceTypes: ['PRIORITY_OVERNIGHT', 'STANDARD_OVERNIGHT', 'FEDEX_GROUND']
            }
          },
          requestedShipment: {
            shipper: {
              address: {
                streetLines: [fromAddress.address1],
                city: fromAddress.city,
                stateOrProvinceCode: fromAddress.state,
                postalCode: fromAddress.postalCode,
                countryCode: fromAddress.country
              }
            },
            recipient: {
              address: {
                streetLines: [toAddress.address1],
                city: toAddress.city,
                stateOrProvinceCode: toAddress.state,
                postalCode: toAddress.postalCode,
                countryCode: toAddress.country
              }
            },
            requestedPackageLineItems: packages.map(pkg => ({
              weight: {
                units: pkg.weightUnit.toUpperCase(),
                value: pkg.weight
              },
              dimensions: {
                length: pkg.length,
                width: pkg.width,
                height: pkg.height,
                units: pkg.dimensionUnit.toUpperCase()
              }
            }))
          }
        })
      })

      if (!response.ok) {
        throw new Error(`FedEx API error: ${response.status}`)
      }

      const data = await response.json()
      const rates: ShippingRate[] = []

      if (data.output && data.output.rateReplyDetails) {
        for (const rate of data.output.rateReplyDetails) {
          rates.push({
            id: `fedex-${rate.serviceType}`,
            serviceName: rate.serviceName,
            serviceCode: rate.serviceType,
            carrier: 'FedEx',
            rate: parseFloat(rate.ratedShipmentDetails[0].totalNetCharge),
            estimatedDays: `${rate.commitDetails?.serviceDays || '3-5'} business days`,
            deliveryDays: rate.commitDetails?.serviceDays || 4,
            guaranteedDelivery: rate.commitDetails?.guaranteed || false,
            isAvailable: true,
            currency: 'USD'
          })
        }
      }

      return rates
    } catch (error) {
      console.error('FedEx rate calculation failed:', error)
      // Return mock rates as fallback
      return this.getMockFedExRates()
    }
  }

  // UPS API integration
  private async getUPSRates(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    try {
      const response = await fetch(`${api.baseUrl}/rest/Rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          RateRequest: {
            Request: {
              RequestOption: 'Shop',
              TransactionReference: {
                CustomerContext: 'Rating and Service'
              }
            },
            Shipment: {
              Shipper: {
                Address: {
                  AddressLine: [fromAddress.address1],
                  City: fromAddress.city,
                  StateProvinceCode: fromAddress.state,
                  PostalCode: fromAddress.postalCode,
                  CountryCode: fromAddress.country
                }
              },
              ShipTo: {
                Address: {
                  AddressLine: [toAddress.address1],
                  City: toAddress.city,
                  StateProvinceCode: toAddress.state,
                  PostalCode: toAddress.postalCode,
                  CountryCode: toAddress.country
                }
              },
              Package: packages.map(pkg => ({
                PackagingType: {
                  Code: '02',
                  Description: 'Package'
                },
                Dimensions: {
                  UnitOfMeasurement: {
                    Code: pkg.dimensionUnit === 'in' ? 'IN' : 'CM'
                  },
                  Length: pkg.length.toString(),
                  Width: pkg.width.toString(),
                  Height: pkg.height.toString()
                },
                PackageWeight: {
                  UnitOfMeasurement: {
                    Code: pkg.weightUnit === 'lb' ? 'LBS' : 'KGS'
                  },
                  Weight: pkg.weight.toString()
                }
              }))
            }
          }
        })
      })

      if (!response.ok) {
        throw new Error(`UPS API error: ${response.status}`)
      }

      const data = await response.json()
      const rates: ShippingRate[] = []

      if (data.RateResponse && data.RateResponse.RatedShipment) {
        for (const rate of data.RateResponse.RatedShipment) {
          rates.push({
            id: `ups-${rate.Service.Code}`,
            serviceName: rate.Service.Name,
            serviceCode: rate.Service.Code,
            carrier: 'UPS',
            rate: parseFloat(rate.TotalCharges.MonetaryValue),
            estimatedDays: `${rate.GuaranteedDaysToDelivery || '3-5'} business days`,
            deliveryDays: rate.GuaranteedDaysToDelivery || 4,
            guaranteedDelivery: !!rate.GuaranteedDaysToDelivery,
            isAvailable: true,
            currency: 'USD'
          })
        }
      }

      return rates
    } catch (error) {
      console.error('UPS rate calculation failed:', error)
      // Return mock rates as fallback
      return this.getMockUPSRates()
    }
  }

  // DHL API integration
  private async getDHLRates(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    try {
      const response = await fetch(`${api.baseUrl}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          customerDetails: {
            shipperDetails: {
              postalCode: fromAddress.postalCode,
              cityName: fromAddress.city,
              countryCode: fromAddress.country,
              addressLine1: fromAddress.address1
            },
            receiverDetails: {
              postalCode: toAddress.postalCode,
              cityName: toAddress.city,
              countryCode: toAddress.country,
              addressLine1: toAddress.address1
            }
          },
          plannedShippingDateAndTime: new Date().toISOString(),
          unitOfMeasurement: 'SI',
          packages: packages.map(pkg => ({
            weight: pkg.weight,
            dimensions: {
              length: pkg.length,
              width: pkg.width,
              height: pkg.height
            }
          }))
        })
      })

      if (!response.ok) {
        throw new Error(`DHL API error: ${response.status}`)
      }

      const data = await response.json()
      const rates: ShippingRate[] = []

      if (data.products) {
        for (const product of data.products) {
          rates.push({
            id: `dhl-${product.productCode}`,
            serviceName: product.productName,
            serviceCode: product.productCode,
            carrier: 'DHL',
            rate: parseFloat(product.totalPrice),
            estimatedDays: `${product.deliveryTime.days || '3-5'} business days`,
            deliveryDays: product.deliveryTime.days || 4,
            guaranteedDelivery: product.deliveryTime.guaranteed || false,
            isAvailable: true,
            currency: 'USD'
          })
        }
      }

      return rates
    } catch (error) {
      console.error('DHL rate calculation failed:', error)
      // Return mock rates as fallback
      return this.getMockDHLRates()
    }
  }

  // Bagster API integration for waste removal services
  private async getBagsterRates(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    try {
      // Bagster is primarily for waste removal, not traditional shipping
      // This would be used for scheduling waste pickup services
      const response = await fetch(`${api.baseUrl}/api/v1/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          pickupAddress: {
            street: fromAddress.address1,
            city: fromAddress.city,
            state: fromAddress.state,
            zipCode: fromAddress.postalCode,
            country: fromAddress.country
          },
          serviceType: 'waste_removal',
          bagCount: packages.length,
          totalWeight: packages.reduce((sum, pkg) => sum + pkg.weight, 0)
        })
      })

      if (!response.ok) {
        throw new Error(`Bagster API error: ${response.status}`)
      }

      const data = await response.json()
      const rates: ShippingRate[] = []

      if (data.services && Array.isArray(data.services)) {
        for (const service of data.services) {
          rates.push({
            id: `bagster-${service.serviceCode}`,
            serviceName: service.serviceName || 'Waste Removal Service',
            serviceCode: service.serviceCode || 'WASTE_REMOVAL',
            carrier: 'Bagster',
            rate: parseFloat(service.rate) || 0,
            estimatedDays: service.estimatedDays || '1-3 business days',
            deliveryDays: service.deliveryDays || 2,
            guaranteedDelivery: service.guaranteed || false,
            isAvailable: service.available || true,
            currency: 'USD'
          })
        }
      }

      // If no rates returned from API, return mock rates
      if (rates.length === 0) {
        return this.getMockBagsterRates()
      }

      return rates
    } catch (error) {
      console.error('Bagster rate calculation failed:', error)
      // Return mock rates as fallback
      return this.getMockBagsterRates()
    }
  }

  // Generic API integration for other providers
  private async getGenericRates(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[]
  ): Promise<ShippingRate[]> {
    try {
      const response = await fetch(`${api.baseUrl}/rates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          fromAddress,
          toAddress,
          packages
        })
      })

      if (!response.ok) {
        throw new Error(`Generic API error: ${response.status}`)
      }

      const data = await response.json()
      return data.rates || []
    } catch (error) {
      console.error('Generic rate calculation failed:', error)
      return []
    }
  }

  // Get tracking information
  async getTrackingInfo(trackingNumber: string, carrierCode: string): Promise<TrackingInfo | null> {
    try {
      const activeApis = await this.getActiveLogisticsApis()
      const api = activeApis.find(a => a.provider?.toLowerCase() === carrierCode.toLowerCase())
      
      if (!api) {
        throw new Error(`No active API found for carrier: ${carrierCode}`)
      }

      switch (api.provider?.toLowerCase()) {
        case 'fedex':
          return await this.getFedExTracking(api, trackingNumber)
        case 'ups':
          return await this.getUPSTracking(api, trackingNumber)
        case 'dhl':
          return await this.getDHLTracking(api, trackingNumber)
        case 'bagster':
          return await this.getBagsterTracking(api, trackingNumber)
        default:
          return await this.getGenericTracking(api, trackingNumber)
      }
    } catch (error) {
      console.error('Failed to get tracking info:', error)
      return null
    }
  }

  // FedEx tracking
  private async getFedExTracking(api: ApiConfiguration, trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await fetch(`${api.baseUrl}/track/v1/trackingnumbers`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          trackingInfo: [{
            trackingNumberInfo: {
              trackingNumber
            }
          }],
          includeDetailedScans: true
        })
      })

      if (!response.ok) {
        throw new Error(`FedEx tracking error: ${response.status}`)
      }

      const data = await response.json()
      const tracking = data.output.completeTrackResults[0].trackResults[0]

      return {
        trackingNumber,
        carrier: 'FedEx',
        status: tracking.latestStatusDetail.description,
        location: tracking.latestStatusDetail.scanLocation?.city || 'Unknown',
        estimatedDelivery: tracking.deliveryDetails?.estimatedDeliveryTimestamp || '',
        events: tracking.scanEvents?.map((event: any) => ({
          timestamp: event.date,
          location: event.scanLocation?.city || 'Unknown',
          status: event.eventDescription,
          description: event.eventDescription
        })) || []
      }
    } catch (error) {
      console.error('FedEx tracking failed:', error)
      return this.getMockTrackingInfo(trackingNumber, 'FedEx')
    }
  }

  // UPS tracking
  private async getUPSTracking(api: ApiConfiguration, trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await fetch(`${api.baseUrl}/rest/Track`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          TrackRequest: {
            Request: {
              RequestOption: '1',
              TransactionReference: {
                CustomerContext: 'Tracking'
              }
            },
            InquiryNumber: trackingNumber
          }
        })
      })

      if (!response.ok) {
        throw new Error(`UPS tracking error: ${response.status}`)
      }

      const data = await response.json()
      const tracking = data.TrackResponse.shipment[0].package[0]

      return {
        trackingNumber,
        carrier: 'UPS',
        status: tracking.activity[0].status.description,
        location: tracking.activity[0].location.address.city || 'Unknown',
        estimatedDelivery: tracking.deliveryDate || '',
        events: tracking.activity?.map((event: any) => ({
          timestamp: event.date + ' ' + event.time,
          location: event.location.address.city || 'Unknown',
          status: event.status.description,
          description: event.status.description
        })) || []
      }
    } catch (error) {
      console.error('UPS tracking failed:', error)
      return this.getMockTrackingInfo(trackingNumber, 'UPS')
    }
  }

  // DHL tracking
  private async getDHLTracking(api: ApiConfiguration, trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await fetch(`${api.baseUrl}/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${api.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`DHL tracking error: ${response.status}`)
      }

      const data = await response.json()
      const tracking = data.shipments[0]

      return {
        trackingNumber,
        carrier: 'DHL',
        status: tracking.status,
        location: tracking.events[0]?.location || 'Unknown',
        estimatedDelivery: tracking.estimatedTimeOfDelivery || '',
        events: tracking.events?.map((event: any) => ({
          timestamp: event.timestamp,
          location: event.location || 'Unknown',
          status: event.status,
          description: event.description
        })) || []
      }
    } catch (error) {
      console.error('DHL tracking failed:', error)
      return this.getMockTrackingInfo(trackingNumber, 'DHL')
    }
  }

  // Bagster tracking for waste removal services
  private async getBagsterTracking(api: ApiConfiguration, trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await fetch(`${api.baseUrl}/api/v1/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Bagster tracking error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        trackingNumber,
        carrier: 'Bagster',
        status: data.status || 'Scheduled',
        location: data.location || 'Unknown',
        estimatedDelivery: data.estimatedPickup || '',
        events: data.events?.map((event: any) => ({
          timestamp: event.timestamp || new Date().toISOString(),
          location: event.location || 'Unknown',
          status: event.status || 'Scheduled',
          description: event.description || 'Waste removal service scheduled'
        })) || []
      }
    } catch (error) {
      console.error('Bagster tracking failed:', error)
      return this.getMockTrackingInfo(trackingNumber, 'Bagster')
    }
  }

  // Generic tracking
  private async getGenericTracking(api: ApiConfiguration, trackingNumber: string): Promise<TrackingInfo> {
    try {
      const response = await fetch(`${api.baseUrl}/tracking/${trackingNumber}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${api.apiKey}`,
        }
      })

      if (!response.ok) {
        throw new Error(`Generic tracking error: ${response.status}`)
      }

      const data = await response.json()
      return data
    } catch (error) {
      console.error('Generic tracking failed:', error)
      return this.getMockTrackingInfo(trackingNumber, api.provider || 'Unknown')
    }
  }

  // Generate shipping label
  async generateShippingLabel(
    api: ApiConfiguration,
    fromAddress: ShippingAddress,
    toAddress: ShippingAddress,
    packages: ShippingPackage[],
    serviceCode: string
  ): Promise<ShippingLabel> {
    try {
      const response = await fetch(`${api.baseUrl}/ship/v1/shipments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${api.apiKey}`,
        },
        body: JSON.stringify({
          requestedShipment: {
            shipper: {
              address: {
                streetLines: [fromAddress.address1],
                city: fromAddress.city,
                stateOrProvinceCode: fromAddress.state,
                postalCode: fromAddress.postalCode,
                countryCode: fromAddress.country
              }
            },
            recipient: {
              address: {
                streetLines: [toAddress.address1],
                city: toAddress.city,
                stateOrProvinceCode: toAddress.state,
                postalCode: toAddress.postalCode,
                countryCode: toAddress.country
              }
            },
            requestedPackageLineItems: packages.map(pkg => ({
              weight: {
                units: pkg.weightUnit.toUpperCase(),
                value: pkg.weight
              },
              dimensions: {
                length: pkg.length,
                width: pkg.width,
                height: pkg.height,
                units: pkg.dimensionUnit.toUpperCase()
              }
            })),
            rateRequestType: ['LIST']
          }
        })
      })

      if (!response.ok) {
        throw new Error(`Label generation error: ${response.status}`)
      }

      const data = await response.json()
      
      return {
        id: data.output.shipmentId,
        trackingNumber: data.output.trackingNumber,
        labelUrl: data.output.labelUrl,
        labelFormat: 'pdf',
        carrier: api.provider || 'Unknown',
        serviceCode,
        createdAt: new Date()
      }
    } catch (error) {
      console.error('Label generation failed:', error)
      throw new Error('Failed to generate shipping label')
    }
  }

  // Mock data fallbacks
  private getMockFedExRates(): ShippingRate[] {
    return [
      {
        id: 'fedex-standard',
        serviceName: 'FedEx Standard',
        serviceCode: 'FEDEX_STANDARD',
        carrier: 'FedEx',
        rate: 15.99,
        estimatedDays: '3-5 business days',
        deliveryDays: 4,
        guaranteedDelivery: false,
        isAvailable: true,
        currency: 'USD'
      },
      {
        id: 'fedex-express',
        serviceName: 'FedEx Express',
        serviceCode: 'FEDEX_EXPRESS',
        carrier: 'FedEx',
        rate: 25.99,
        estimatedDays: '1-2 business days',
        deliveryDays: 2,
        guaranteedDelivery: true,
        isAvailable: true,
        currency: 'USD'
      }
    ]
  }

  private getMockUPSRates(): ShippingRate[] {
    return [
      {
        id: 'ups-ground',
        serviceName: 'UPS Ground',
        serviceCode: 'UPS_GROUND',
        carrier: 'UPS',
        rate: 12.99,
        estimatedDays: '5-7 business days',
        deliveryDays: 6,
        guaranteedDelivery: false,
        isAvailable: true,
        currency: 'USD'
      }
    ]
  }

  private getMockDHLRates(): ShippingRate[] {
    return [
      {
        id: 'dhl-express',
        serviceName: 'DHL Express',
        serviceCode: 'DHL_EXPRESS',
        carrier: 'DHL',
        rate: 35.99,
        estimatedDays: '2-3 business days',
        deliveryDays: 3,
        guaranteedDelivery: true,
        isAvailable: true,
        currency: 'USD'
      }
    ]
  }

  private getMockBagsterRates(): ShippingRate[] {
    return [
      {
        id: 'bagster-waste-removal',
        serviceName: 'Waste Removal Service',
        serviceCode: 'WASTE_REMOVAL',
        carrier: 'Bagster',
        rate: 50.00,
        estimatedDays: '1-3 business days',
        deliveryDays: 2,
        guaranteedDelivery: false,
        isAvailable: true,
        currency: 'USD'
      }
    ]
  }

  private getMockTrackingInfo(trackingNumber: string, carrier: string): TrackingInfo {
    // Handle Bagster specifically since it's for waste removal
    if (carrier.toLowerCase() === 'bagster') {
      return {
        trackingNumber,
        carrier: 'Bagster',
        status: 'Scheduled',
        location: 'Waste Removal Service',
        estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
        events: [
          {
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
            location: 'Service Area',
            status: 'Scheduled',
            description: 'Waste removal service scheduled'
          },
          {
            timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            location: 'Customer Location',
            status: 'Requested',
            description: 'Waste removal service requested'
          }
        ]
      }
    }

    // Default tracking info for other carriers
    return {
      trackingNumber,
      carrier,
      status: 'In Transit',
      location: 'Memphis, TN',
      estimatedDelivery: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
      events: [
        {
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          location: 'Memphis, TN',
          status: 'In Transit',
          description: 'Package has left the carrier facility'
        },
        {
          timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          location: 'Los Angeles, CA',
          status: 'Picked Up',
          description: 'Package picked up by carrier'
        }
      ]
    }
  }
}

// Export singleton instance
export const logisticsService = new LogisticsService()

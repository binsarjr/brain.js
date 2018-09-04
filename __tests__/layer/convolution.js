import gpuMock from 'gpu-mock.js'
import {
  predict,
  compareFilters,
  compareInputs,
  compareBiases,
} from '../../src/layer/convolution'

describe('Convolution Layer', () => {
  describe('.predict (forward propagation)', () => {
    test('can convolution a simple matrix', () => {
      const inputs = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]
      const filters = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]
      const biases = [1, 2, 3]

      const results = gpuMock(predict, {
        output: [3, 3],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
        },
      })(filters, inputs, biases)

      expect(results).toEqual([[286, 187, 91], [155, 95, 43], [51, 27, 10]])
    })
  })

  describe('.compareFilters (back propagation)', () => {
    test('can convolution a simple matrix', () => {
      const filters = [[[1, 2], [3, 4]]]
      const inputs = [[[1, 2], [3, 4]]]
      const deltas = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]
      const results = gpuMock(compareFilters, {
        output: [2, 2],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 2,
          filterWidth: 2,
          filterCount: 1,
          inputWidth: 2,
          inputHeight: 2,
          inputDepth: 1,
          deltasDepth: 1,
          deltasHeight: 3,
          deltasWidth: 3
        },
      })(filters, inputs, deltas)

      expect(results).toEqual([[38, 49], [70, 81]])
    })
  })

  describe('.compareInputs (back propagation)', () => {
    test('can convolution a simple matrix', () => {
      const inputs = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]
      const deltas = [[[1, 2, 3], [4, 5, 6], [7, 8, 9]]]
      const results = gpuMock(compareInputs, {
        output: [3, 3],
        constants: {
          strideX: 1,
          strideY: 1,
          paddingY: 0,
          paddingX: 0,
          filterHeight: 3,
          filterWidth: 3,
          filterCount: 1,
          inputWidth: 3,
          inputHeight: 3,
          inputDepth: 1,
        },
      })(inputs, deltas)

      expect(results).toEqual([[1, 4, 10], [8, 26, 56], [30, 84, 165]])
    })
  })

  describe('.compareBiases (back propagation)', () => {
    const deltas = [
      [[0, 16], [8, 24]],
      [[1, 17], [9, 25]],
      [[2, 18], [10, 26]],
      [[3, 19], [11, 27]],
      [[4, 20], [12, 28]],
      [[5, 21], [13, 29]],
      [[6, 22], [14, 30]],
      [[7, 23], [15, 31]],
    ]
    test('accumulates values from deltas correctly from 0', () => {
      const biasDeltas = [0, 0, 0, 0, 0, 0, 0, 0]
      const kernel = gpuMock(compareBiases, {
        output: [1, 1, 8],
        constants: {
          x: 2,
          y: 2,
        },
      })
      const result = kernel(biasDeltas, deltas)
      const expectedBiasDeltas = [
        [[48]],
        [[52]],
        [[56]],
        [[60]],
        [[64]],
        [[68]],
        [[72]],
        [[76]],
      ]

      expect(result).toEqual(expectedBiasDeltas)
    })
    test('accumulates values from deltas correctly from greater than 0', () => {
      const biasDeltas = [0, 1, 2, 3, 4, 5, 6, 7]
      const kernel = gpuMock(compareBiases, {
        output: [1, 1, 8],
        constants: {
          x: 2,
          y: 2,
        },
      })
      const result = kernel(biasDeltas, deltas)
      const expectedBiasDeltas = [
        [[48]],
        [[53]],
        [[58]],
        [[63]],
        [[68]],
        [[73]],
        [[78]],
        [[83]],
      ]

      expect(result).toEqual(expectedBiasDeltas)
    })
  })
})
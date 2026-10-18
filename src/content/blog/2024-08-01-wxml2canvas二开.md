---
title: "wxml2canvas二开"
description: "1. wxml2canvas在非页面级组件中绘制图片位置错乱问题。 2. 多行文字绘制时，会将页面中异常的文字也绘制出来的问题。"
pubDate: 2024-08-01
category: "代码箱"
tags:
  - "代码片段"
featured: false
draft: false
---

## 一、修复问题
1. wxml2canvas在非页面级组件中绘制图片位置错乱问题。
2. 多行文字绘制时，会将页面中异常的文字也绘制出来的问题。

## 二、代码
```js
/* eslint-disable */
const PROPERTIES = ['hover-class', 'hover-start-time', 'space', 'src']
const COMPUTED_STYLE = [
	'color',
	'font-size',
	'font-weight',
	'font-family',
	'backgroundColor',
	'border',
	'border-radius',
	'box-sizing',
	'line-height',
]
const DEFAULT_BORDER = '0px none rgb(0, 0, 0)'
const DEFAULT_BORDER_RADIUS = '0px'

// default z-index??
const DEFAULT_RANK = {
	view: 0,
	image: 1,
	text: 2,
}

const drawWrapper = (context, data) => {
	const {
		backgroundColor,
		width,
		height
	} = data
	context.setFillStyle(backgroundColor)
	context.fillRect(0, 0, width, height)
}

// todo: do more for different language
const strLen = str => {
	let count = 0
	for (let i = 0, len = str.length; i < len; i++) {
		count += str.charCodeAt(i) < 256 ? 1 : 2
	}
	return count / 2
}

const isMuitlpleLine = (data, text) => {
	const {
		'font-size': letterWidth,
		width
	} = data
	const length = strLen(text)
	const rowlineLength = length * parseInt(letterWidth, 10)
	return rowlineLength > width
}

const drawMutipleLine = (context, data, text) => {
	const {
		'font-size': letterWidth,
		width,
		height,
		left,
		top,
		'line-height': lineHeightAttr,
	} = data
	const size = data.dataset.size || 0;
	const lineHieght = lineHeightAttr === 'normal' ? Math.round(1.2 * letterWidth) : lineHeightAttr
	const rowLetterCount = Math.floor(width / parseInt(size != 0 ? size : letterWidth, 10))
	const length = text.length;
	
	const rowCount = Math.floor(height / parseInt(lineHieght, 10)) // 待绘制行数
	let drawLength = 0; // 已绘制长度
	
	const lineclamp = data.dataset.lineclamp || 0; // 仅展示展示前几行
	let curDrawLine = 0; // 当前绘制行
	let ellipsisWidth = 0; // 省略号所占宽度
	if(lineclamp) {
		ellipsisWidth = context.measureText('…').width;
	}
	
	for(let i = 0; i < rowCount; i++) {
			let lineText = text.substring(drawLength, drawLength + rowLetterCount); 
			drawLength += rowLetterCount;
			lineFor:for(let t = drawLength; t < text.length; t++) {
				const measureWidth = context.measureText(lineText).width;
				if(measureWidth <= width - parseInt(letterWidth, 10)) {
					lineText += text[t];
					drawLength++;
				} else {
					break lineFor;
				}
			}
			
			if(lineclamp && i === rowCount - 1) { // 如果需要省略号 且是待绘制最后一行
				lineText = lineText.substr(0, lineText.length - 1) + '…';
			}
			
			const rowTop = top + i * parseInt(lineHieght, 10);
			context.fillText(lineText, left, rowTop);
			
			if(lineclamp) curDrawLine++;
	}
}

// enable color, font, for now only support chinese
const drawText = (context, data) => {
	const {
		dataset: {
			text,
			lineClamp,
		},
		left,
		top,
		color,
		'font-weight': fontWeight,
		'font-size': fontSize,
		'font-family': fontFamily
	} = data
	const canvasText = Array.isArray(text) ? text[0] : text
	context.font = `${fontWeight} ${Math.round(
    parseFloat(fontSize),
  )}px ${fontFamily}`
	context.setFillStyle(color)
	if (isMuitlpleLine(data, canvasText)) {
		drawMutipleLine(context, data, canvasText)
	} else {
		context.fillText(canvasText, left, top)
	}
	context.restore()
}

const getImgInfo = src =>
	new Promise((resolve, reject) => {
		uni.getImageInfo({
			src,
			success(res) {
				resolve(res)
			},
		})
	})
const hasBorder = border => border !== DEFAULT_BORDER
const hasBorderRadius = borderRadius => borderRadius !== DEFAULT_BORDER_RADIUS
const getBorderAttributes = border => {
	let borderColor, borderStyle;
	let borderWidth = 0
	if (hasBorder(border)) {
		borderWidth = parseInt(border.split(/\s/)[0], 10)
		borderStyle = border.split(/\s/)[1]
		// borderColor = border.match(/(rgb).*/gi)[0]

		borderColor = border.match(/(rgb).*/gi) != null ? border.match(/(rgb).*/gi)[0] : ['255', '255', '255']
	}
	return {
		borderWidth,
		borderStyle,
		borderColor,
	}
}

const getImgRect = (imgData, borderWidth) => {
	const {
		width,
		height,
		left,
		top
	} = imgData
	const imgWidth = width - 2 * borderWidth
	const imgHeight = height - 2 * borderWidth
	const imgLeft = left + borderWidth
	const imgTop = top + borderWidth
	return {
		imgWidth,
		imgHeight,
		imgLeft,
		imgTop,
	}
}

const getArcCenterPosition = imgData => {
	const {
		width,
		height,
		left,
		top
	} = imgData
	const coordX = width / 2 + left
	const coordY = height / 2 + top
	return {
		coordX,
		coordY,
	}
}

const getArcRadius = (imgData, borderWidth = 0) => {
	const {
		width
	} = imgData
	return width / 2 - borderWidth / 2
}

const getCalculatedImagePosition = (imgData, naturalWidth, naturalHeight) => {
	const {
		border
	} = imgData
	const {
		borderWidth
	} = getBorderAttributes(border)
	const {
		imgWidth,
		imgHeight,
		imgLeft,
		imgTop
	} = getImgRect(
		imgData,
		borderWidth,
	)
	const ratio = naturalWidth / naturalHeight
	// tweak for real width and position => center center
	const realWidth = ratio > 0 ? imgWidth : imgHeight * ratio
	const realHeight = ratio > 0 ? imgWidth * (1 / ratio) : imgHeight
	const offsetLeft = ratio > 0 ? 0 : (imgWidth - realWidth) / 2
	const offsetTop = ratio > 0 ? (imgHeight - realHeight) / 2 : 0
	return {
		realWidth,
		realHeight,
		left: imgLeft + offsetLeft,
		top: imgTop + offsetTop,
	}
}

const drawArcImage = (context, imgData) => {
	const {
		src
	} = imgData
	const {
		coordX,
		coordY
	} = getArcCenterPosition(imgData)
	return getImgInfo(src).then(res => {
		const {
			width: naturalWidth,
			height: naturalHeight
		} = res
		const arcRadius = getArcRadius(imgData)
		context.save()
		context.beginPath()
		context.arc(coordX, coordY, arcRadius, 0, 2 * Math.PI)
		context.closePath()
		context.clip()
		const {
			left,
			top,
			realWidth,
			realHeight
		} = getCalculatedImagePosition(
			imgData,
			naturalWidth,
			naturalHeight,
		)
		context.drawImage(
			src,
			0,
			0,
			naturalWidth,
			naturalHeight,
			left,
			top,
			realWidth,
			realHeight,
		)
		context.restore()
	})
}

const drawRectImage = (context, imgData) => {
	const {
		src,
		width,
		height,
		left,
		top
	} = imgData

	return getImgInfo(src).then(res => {
		const {
			width: naturalWidth,
			height: naturalHeight
		} = res
		context.save()
		context.beginPath()
		context.rect(left, top, width, height)
		context.closePath()
		context.clip()

		const {
			left: realLeft,
			top: realTop,
			realWidth,
			realHeight,
		} = getCalculatedImagePosition(imgData, naturalWidth, naturalHeight)
		context.drawImage(
			src,
			0,
			0,
			naturalWidth,
			naturalHeight,
			realLeft,
			realTop,
			realWidth,
			realHeight,
		)
		context.restore()
	})
}

const drawArcBorder = (context, imgData) => {
	const {
		border
	} = imgData
	const {
		coordX,
		coordY
	} = getArcCenterPosition(imgData)
	const {
		borderWidth,
		borderColor
	} = getBorderAttributes(border)
	const arcRadius = getArcRadius(imgData, borderWidth)
	context.save()
	context.beginPath()
	context.setLineWidth(borderWidth)
	context.setStrokeStyle(borderColor)
	context.arc(coordX, coordY, arcRadius, 0, 2 * Math.PI)
	context.stroke()
	context.restore()
}

const drawRectBorder = (context, imgData) => {
	const {
		border
	} = imgData
	const {
		left,
		top,
		width,
		height
	} = imgData
	const {
		borderWidth,
		borderColor
	} = getBorderAttributes(border)

	const correctedBorderWidth = borderWidth + 1 // draw may cause empty 0.5 space
	context.save()
	context.beginPath()
	context.setLineWidth(correctedBorderWidth)
	context.setStrokeStyle(borderColor)

	context.rect(
		left + borderWidth / 2,
		top + borderWidth / 2,
		width - borderWidth,
		height - borderWidth,
	)
	context.stroke()
	context.restore()
}

// image, enable border-radius: 50%, border, bgColor
const drawImage = (context, imgData) => {
	const {
		border,
		'border-radius': borderRadius
	} = imgData
	let drawImagePromise
	if (hasBorderRadius(borderRadius)) {
		drawImagePromise = drawArcImage(context, imgData)
	} else {
		drawImagePromise = drawRectImage(context, imgData)
	}
	return drawImagePromise.then(() => {
		if (hasBorder(border)) {
			if (hasBorderRadius(borderRadius)) {
				return drawArcBorder(context, imgData)
			} else {
				return drawRectBorder(context, imgData)
			}
		}
		return Promise.resolve()
	})
}

// e.g. 10%, 4px
const getBorderRadius = imgData => {
	const {
		width,
		height,
		'border-radius': borderRadiusAttr
	} = imgData
	const borderRadius = parseInt(borderRadiusAttr, 10)
	if (borderRadiusAttr.indexOf('%') !== -1) {
		const borderRadiusX = parseInt(borderRadius / 100 * width, 10)
		const borderRadiusY = parseInt(borderRadius / 100 * height, 10)
		return {
			isCircle: borderRadiusX === borderRadiusY,
			borderRadius: borderRadiusX,
			borderRadiusX,
			borderRadiusY,
		}
	} else {
		return {
			isCircle: true,
			borderRadius,
		}
	}
}

const drawViewArcBorder = (context, imgData) => {
	const {
		width,
		height,
		left,
		top,
		backgroundColor,
		border,
		type
	} = imgData
	const {
		borderRadius
	} = getBorderRadius(imgData)
	const {
		borderWidth,
		borderColor
	} = getBorderAttributes(border)
	context.beginPath()
	context.moveTo(left + borderRadius, top)
	context.lineTo(left + width - borderRadius, top)
	context.arcTo(
		left + width,
		top,
		left + width,
		top + borderRadius,
		borderRadius,
	)
	context.lineTo(left + width, top + height - borderRadius)
	context.arcTo(
		left + width,
		top + height,
		left + width - borderRadius,
		top + height,
		borderRadius,
	)
	context.lineTo(left + borderRadius, top + height)
	context.arcTo(
		left,
		top + height,
		left,
		top + height - borderRadius,
		borderRadius,
	)
	context.lineTo(left, top + borderRadius)
	context.arcTo(left, top, left + borderRadius, top, borderRadius)
	context.closePath()
	if (backgroundColor && type == 'view') {
		context.setFillStyle(backgroundColor)
		context.fill()
	}
	if (borderColor && borderWidth) {
		context.setLineWidth(borderWidth)
		context.setStrokeStyle(borderColor)
		context.stroke()
	}
}

const drawViewBezierBorder = (context, imgData) => {
	const {
		width,
		height,
		left,
		top,
		backgroundColor,
		border,
		type
	} = imgData
	const {
		borderWidth,
		borderColor
	} = getBorderAttributes(border)
	const {
		borderRadiusX,
		borderRadiusY
	} = getBorderRadius(imgData)
	context.beginPath()
	context.moveTo(left + borderRadiusX, top)
	context.lineTo(left + width - borderRadiusX, top)
	context.quadraticCurveTo(left + width, top, left + width, top + borderRadiusY)
	context.lineTo(left + width, top + height - borderRadiusY)
	context.quadraticCurveTo(
		left + width,
		top + height,
		left + width - borderRadiusX,
		top + height,
	)
	context.lineTo(left + borderRadiusX, top + height)
	context.quadraticCurveTo(
		left,
		top + height,
		left,
		top + height - borderRadiusY,
	)
	context.lineTo(left, top + borderRadiusY)
	context.quadraticCurveTo(left, top, left + borderRadiusX, top)
	context.closePath()
	if (backgroundColor && type == 'view') {
		context.setFillStyle(backgroundColor)
		context.fill()
	}
	if (borderColor && borderWidth) {
		context.setLineWidth(borderWidth)
		context.setStrokeStyle(borderColor)
		context.stroke()
	}
}

// enable border, border-radius, bgColor, position
const drawView = (context, imgData) => {
	const {
		isCircle
	} = getBorderRadius(imgData)
	if (isCircle) {
		drawViewArcBorder(context, imgData)
	} else {
		drawViewBezierBorder(context, imgData)
	}
}

const isTextElement = item => {
	const {
		dataset: {
			text
		},
		type
	} = item
	return Boolean(text) || type === 'text'
}

const isImageElement = item => {
	const {
		src,
		type
	} = item
	return Boolean(src) || type === 'image'
}

const isViewElement = item => {
	const {
		type
	} = item
	return type === 'view'
}

const formatElementData = elements =>
	elements.map(element => {
		if (isTextElement(element)) {
			element.type = 'text'
			element.rank = DEFAULT_RANK.text
		} else if (isImageElement(element)) {
			element.type = 'image'
			element.rank = DEFAULT_RANK.image
		} else {
			element.type = 'view'
			element.rank = DEFAULT_RANK.view
		}
		return element
	})

// todo: use z-index as order to draw??
const getSortedElementsData = elements =>
	elements.sort((a, b) => {
		if (a.rank < b.rank) {
			return -1
		} else if (a.rank > b.rank) {
			return 1
		}
		return 0
	})

const drawElements = (context, storeItems) => {
	const itemPromise = []
	storeItems.forEach(item => {
		if (isTextElement(item)) {
			const text = drawText(context, item)
			itemPromise.push(text)
		} else if (isImageElement(item)) {
			const image = drawImage(context, item)
			itemPromise.push(image)
		} else {
			const view = drawView(context, item)
			itemPromise.push(view)
		}
	})
	return itemPromise
}

// storeObject: { 0: [...], 1: [...] }
// chain call promise based on Object key
const drawElementBaseOnIndex = (context, storeObject, key = 0, drawPromise) => {
	if (typeof drawPromise === 'undefined') {
		drawPromise = Promise.resolve()
	}
	const objectKey = key // note: key is changing when execute promise then
	const chainPromise = drawPromise.then(() => {
		const nextPromise = storeObject[objectKey] ?
			Promise.all(drawElements(context, storeObject[objectKey])) :
			Promise.resolve()
		return nextPromise
	})

	if (key >= Object.keys(storeObject).length) {
		return chainPromise
	} else {
		return drawElementBaseOnIndex(context, storeObject, key + 1, chainPromise)
	}
}

const drawCanvas = (canvasId, wrapperData, innerData, self) => {
	let context;
	if(self) {
		context = wx.createCanvasContext(canvasId, self)
	} else {
		context = wx.createCanvasContext(canvasId)
	}
	context.setTextBaseline('top')

	// todo: use this after weixin fix stupid clip can't work bug in fillRect
	// for now, just set canvas background as a compromise
	drawWrapper(context, wrapperData[0])

	const storeObject = {}

	const sortedElementData = getSortedElementsData(formatElementData(innerData)) // fake z-index
	
	// 根据wrapperData计算元素在画布中正确定位
	sortedElementData.forEach(elementData => {
		elementData.left -= wrapperData[0].left;
		elementData.right -= wrapperData[0].left;
		elementData.top -= wrapperData[0].top;
		elementData.bottom -= wrapperData[0].top;
	})
	
	sortedElementData.forEach(item => {
		if (!storeObject[item.rank]) {
			// initialize
			storeObject[item.rank] = []
		}
		if (isTextElement(item) || isImageElement(item) || isViewElement(item)) {
			storeObject[item.rank].push(item)
		}
	})
	// note: draw is async
	return drawElementBaseOnIndex(context, storeObject).then(
		() =>
		new Promise((resolve, reject) => {
			context.draw(true, () => {
				resolve()
			})
		}),
	)
}

const wxSelectorQuery = (element, self) =>
	new Promise((resolve, reject) => {
		try {
			let query;
			if(self) {
			    query = wx.createSelectorQuery().in(self);
			} else {
			    query = wx.createSelectorQuery();
			}
			query
				.selectAll(element)
				.fields({
						dataset: true,
						size: true,
						rect: true,
						properties: PROPERTIES,
						computedStyle: COMPUTED_STYLE,
					},
					res => {
						resolve(res)
					},
				)
				.exec()
		} catch (error) {
			reject(error)
		}
	})

const wxml2canvas = (wrapperId, elementsClass, canvasId, self) => {
	const getWrapperElement = wxSelectorQuery(wrapperId, self)
	const getInnerElements = wxSelectorQuery(elementsClass, self)
	return Promise.all([getWrapperElement, getInnerElements]).then(data => {
		return drawCanvas(canvasId, data[0], data[1], self)
	})
}

export default wxml2canvas
```

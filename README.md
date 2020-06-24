# react-styled-components
This is a compact implementation of [React styled components](https://styled-components.com/).

This is a example of using descriptive styled components to build a React component.

<pre>
    const Container = styled('div')` 
    width: 100%;
    height: 100%;
    overflow: auto;
    display: flex;
    align-items: center;
    `
    const SubContainer = styled('div')`
    margin-left: 1rem;
    `
    const IconContainer = styled('div')`

    `
    const Icon = styled(AnalyticsIcon)`
    width: 4rem;
    height: 4rem;
    box-shadow: 0 20px 30px 100px white;
    `

    const TextContainer = styled('div')`
    margin-top: 2rem; 
    line-height: 2rem;
    `
    const TextHeading = styled('div')`  
    font-size: 1rem;
    line-height: 1.5rem;
    `
    const Text = styled('div')` 
    line-height: 1.5rem;
    `
    const TextEmphasize = styled('span')`  
    font-family: Rockwell Nova Extra Bold;
    `

    class MyComponent  extends React.Component {

    render() {
        return (
        &lt;React.Fragment&gt;
            &lt;Container&gt;
            &lt;SubContainer&gt;
                &lt;IconContainer&gt;
                &lt;Icon/&gt;
                &lt;/IconContainer&gt;
                &lt;TextContainer&gt;
                &lt;TextHeading&gt;Text headding...&lt;/TextHeading&gt;
                &lt;Text&gt;
                    normal text
                    &lt;TextEmphasize&gt;Emphasized text&lt;/TextEmphasize&gt; 
                    normal text
                &lt;Text&gt;
                &lt;/TextContainer&gt;
            &lt;/SubContainer&gt;
            &lt;/Container&gt;
        &lt;/React.Fragment&gt;
        );
    }
    }
</pre>

